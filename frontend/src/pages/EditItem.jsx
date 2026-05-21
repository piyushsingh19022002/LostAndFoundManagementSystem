import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';

const EditItem = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Deduce type from search params: 'lost' or 'found'
  const deducedType = searchParams.get('type') || 'lost';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    date: '', // Maps to date (lost) or dateFound (found)
    imageUrl: '',
    status: 'lost', // 'lost' / 'found' / 'claimed' / 'returned'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // State for file upload & preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Max size is 5MB.');
        return;
      }
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      if (imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview('');
    }
  };

  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      setError('');
      try {
        let response;
        if (deducedType === 'found') {
          response = await API.get(`/found-items/${id}`);
          const data = response.data;
          setFormData({
            title: data.title,
            description: data.description,
            category: 'Found',
            location: data.location,
            date: data.dateFound ? data.dateFound.split('T')[0] : '',
            imageUrl: data.imageUrl || '',
            status: data.status || 'found',
          });
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
        } else {
          response = await API.get(`/lost-items/${id}`);
          const data = response.data;
          setFormData({
            title: data.title,
            description: data.description,
            category: data.category || 'Lost',
            location: data.location,
            date: data.date ? data.date.split('T')[0] : '',
            imageUrl: data.imageUrl || '',
            status: data.status || 'lost',
          });
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError(err.response?.data?.message || 'Failed to fetch item details. The item may not exist or you might not be authorized.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id, deducedType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required.';
    if (formData.title.length < 3) return 'Title must be at least 3 characters long.';
    if (!formData.description.trim()) return 'Description is required.';
    if (formData.description.length < 10) return 'Description must be at least 10 characters long.';
    if (!formData.location.trim()) return 'Location is required.';
    if (!formData.date) return 'Date is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      let uploadedImageUrl = imagePreview ? formData.imageUrl : '';
      
      if (imageFile) {
        setUploadingImage(true);
        const data = new FormData();
        data.append('image', imageFile);
        
        const uploadResponse = await API.post('/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedImageUrl = uploadResponse.data.imageUrl;
        setUploadingImage(false);
      }

      const isFound = deducedType === 'found';
      const endpoint = isFound ? `/found-items/${id}` : `/lost-items/${id}`;
      
      // Build request payload
      const payload = isFound 
        ? {
            title: formData.title,
            description: formData.description,
            location: formData.location,
            dateFound: formData.date,
            imageUrl: uploadedImageUrl,
            status: formData.status,
          }
        : {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            date: formData.date,
            imageUrl: uploadedImageUrl,
            status: formData.status,
          };

      const response = await API.put(endpoint, payload);

      if (response.status === 200) {
        setSuccess(true);
        
        // Clean up file objects
        setImageFile(null);
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        
        setTimeout(() => {
          navigate('/my-items');
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving item changes:', err);
      setError(err.response?.data?.message || 'Failed to update report. Please verify authorization.');
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="50px" color="#61dafb" />
        <p style={{ marginTop: '16px', color: '#94a3b8' }}>Loading report details...</p>
      </div>
    );
  }

  const isFoundType = deducedType === 'found';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.titleText}>Edit Report</h2>
          <p style={styles.subtitleText}>Modify details for your reported {deducedType} item.</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <span>🎉 Report updated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Form Group: Title */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="title">Item Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={styles.input}
              required
              disabled={saving}
            />
          </div>

          {/* Form Row: Category (Read-Only context) & Status Selector */}
          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label}>Type</label>
              <input
                type="text"
                value={isFoundType ? '🎁 Found Report' : '🎒 Lost Report'}
                style={{ ...styles.input, opacity: 0.6, cursor: 'not-allowed' }}
                disabled
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.select}
                disabled={saving}
              >
                {isFoundType ? (
                  <>
                    <option value="found">Found</option>
                    <option value="claimed">Claimed</option>
                    <option value="returned">Returned</option>
                  </>
                ) : (
                  <>
                    <option value="lost">Lost</option>
                    <option value="found">Found / Resolved</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Form Row: Date & Location */}
          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="date">Date *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={styles.input}
                required
                disabled={saving}
              />
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="location">Location *</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={styles.input}
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Form Group: Image File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Item Image (Upload File)</label>
            <div style={styles.uploadContainer}>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={styles.fileInput}
                disabled={saving || uploadingImage}
              />
              <label htmlFor="imageUpload" style={styles.uploadBox}>
                <span style={styles.uploadIcon}>📷</span>
                <span style={styles.uploadText}>
                  {imageFile ? 'Change Selected File' : 'Choose New Image / Photo'}
                </span>
              </label>
              {imageFile && (
                <div style={styles.fileName}>{imageFile.name}</div>
              )}
            </div>
            
            {imagePreview && (
              <div style={styles.previewWrapper}>
                <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={styles.removeImageBtn}
                  disabled={saving || uploadingImage}
                >
                  ✕ Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Form Group: Description */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.textarea}
              rows={4}
              required
              disabled={saving}
            />
          </div>

          {/* Submit Action Buttons */}
          <div style={styles.actionContainer}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.submitBtn,
                opacity: saving ? 0.7 : 1,
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/my-items')}
              style={styles.cancelBtn}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
    background: 'radial-gradient(circle at center, #1f2937 0%, #111827 100%)',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '600px',
    backgroundColor: 'rgba(31, 41, 55, 0.65)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  titleText: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 10px 0',
    letterSpacing: '-0.025em',
    background: 'linear-gradient(to right, #61dafb, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitleText: {
    fontSize: '0.95rem',
    color: '#9ca3af',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  formRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
  },
  select: {
    padding: '12px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  textarea: {
    padding: '12px 16px',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: 'inherit',
  },
  actionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
  },
  submitBtn: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f3f4f6',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f3f4f6',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  uploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  fileInput: {
    display: 'none',
  },
  uploadBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    color: '#e5e7eb',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  uploadIcon: {
    fontSize: '1.2rem',
  },
  uploadText: {
    letterSpacing: '0.02em',
  },
  fileName: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    wordBreak: 'break-all',
    paddingLeft: '4px',
  },
  previewWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '12px',
    padding: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
  },
  imagePreview: {
    width: '100%',
    maxHeight: '220px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  removeImageBtn: {
    padding: '6px 12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    color: '#fca5a5',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }
};

export default EditItem;

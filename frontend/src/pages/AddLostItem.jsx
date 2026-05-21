import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import Loader from '../components/Loader';

const AddLostItem = () => {
  // 1. Controlled Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    date: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // State for file upload & preview
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const navigate = useNavigate();
  const { title, description, category, location, date, imageUrl } = formData;

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
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };

  // 2. Controlled Inputs Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 3. Form Validation
  const validateForm = () => {
    if (!title.trim()) return 'Title is required.';
    if (title.length < 3) return 'Title must be at least 3 characters long.';
    if (!description.trim()) return 'Description is required.';
    if (description.length < 10) return 'Description must be at least 10 characters long.';
    if (!location.trim()) return 'Location is required.';
    if (!date) return 'Date is required.';
    
    // Future validation for imageUrl format could be placed here if needed
    return null;
  };

  // 4. Form Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Run Frontend Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = '';
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

      const finalItemData = {
        ...formData,
        imageUrl: uploadedImageUrl || imageUrl,
      };

      // Axios request - authorization token is automatically attached by API interceptor in services/api.js
      const response = await API.post('/lost-items', finalItemData);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setFormData({
          title: '',
          description: '',
          category: 'Lost',
          location: '',
          date: '',
          imageUrl: ''
        });
        setImageFile(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview('');
        }
        
        // Short timeout for visual feedback before redirecting
        setTimeout(() => {
          navigate('/items');
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.titleText}>Report Lost or Found Item</h2>
          <p style={styles.subtitleText}>Provide accurate details to help recover or return the item.</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span style={styles.alertText}>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <span style={styles.alertIcon}>🎉</span>
            <span style={styles.alertText}>Item reported successfully! Redirecting...</span>
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
              value={title}
              onChange={handleChange}
              placeholder="e.g. Blue iPhone 13 Pro Max"
              style={styles.input}
              required
              disabled={loading}
            />
          </div>

          {/* Form Row: Category & Date */}
          <div style={styles.formRow}>
            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={handleChange}
                style={styles.select}
                disabled={loading}
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, flex: 1 }}>
              <label style={styles.label} htmlFor="date">Date *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={date}
                onChange={handleChange}
                style={styles.input}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Form Group: Location */}
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="location">Location *</label>
            <input
              id="location"
              type="text"
              name="location"
              value={location}
              onChange={handleChange}
              placeholder="e.g. Central Library, 2nd Floor Study Desk"
              style={styles.input}
              required
              disabled={loading}
            />
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
                disabled={loading || uploadingImage}
              />
              <label htmlFor="imageUpload" style={styles.uploadBox}>
                <span style={styles.uploadIcon}>📷</span>
                <span style={styles.uploadText}>
                  {imageFile ? 'Change Selected File' : 'Choose Image / Photo'}
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
                  disabled={loading || uploadingImage}
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
              value={description}
              onChange={handleChange}
              placeholder="Include details like color, brand, serial number, cases, or distinct marks..."
              style={styles.textarea}
              rows={4}
              required
              disabled={loading}
            />
          </div>

          {/* Submit Button & Links */}
          <div style={styles.actionContainer}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <div style={styles.btnLoadingContent}>
                  <Loader size="20px" color="#ffffff" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Report'
              )}
            </button>

            <div style={styles.linkContainer}>
              <Link to="/items" style={styles.backLink}>
                ← View All Items
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Premium Stylesheet using Vanilla CSS-in-JS Architecture
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
    WebkitBackdropFilter: 'blur(16px)',
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
    transition: 'border-color 0.2s, box-shadow 0.2s',
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
    gap: '16px',
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
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  btnLoadingContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
  },
  linkContainer: {
    textAlign: 'center',
  },
  backLink: {
    color: '#61dafb',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '24px',
  },
  alertIcon: {
    fontSize: '1.2rem',
  },
  alertText: {
    fontSize: '0.9rem',
    color: '#f3f4f6',
    fontWeight: '500',
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

export default AddLostItem;

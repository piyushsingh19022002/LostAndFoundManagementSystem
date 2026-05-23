import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError, showWarning, showPromise } from '../utils/toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { FiPlusCircle, FiCamera, FiTrash2, FiCalendar, FiMapPin, FiArrowLeft } from 'react-icons/fi';

const AddLostItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Lost',
    location: '',
    date: '',
    imageUrl: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const navigate = useNavigate();

  const { title, description, category, location, date, imageUrl } = formData;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showWarning('Image file is too large. Max size is 5MB.');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!title.trim()) return 'Title is required.';
    if (title.length < 3) return 'Title must be at least 3 characters long.';
    if (!description.trim()) return 'Description is required.';
    if (description.length < 10) return 'Description must be at least 10 characters long.';
    if (!location.trim()) return 'Location is required.';
    if (!date) return 'Date is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showWarning(validationError);
      return;
    }

    setIsLoading(true);

    const submitAction = async () => {
      let uploadedImageUrl = '';
      if (imageFile) {
        const data = new FormData();
        data.append('image', imageFile);
        
        const uploadResponse = await API.post('/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedImageUrl = uploadResponse.data.imageUrl;
      }

      const finalItemData = {
        ...formData,
        imageUrl: uploadedImageUrl || imageUrl,
      };

      const response = await API.post('/lost-items', finalItemData);
      return response.data;
    };

    showPromise(submitAction(), {
      loading: 'Uploading images and submitting lost item report...',
      success: (data) => {
        // Clean up preview URL
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setTimeout(() => {
          navigate('/lost-items');
        }, 1500);
        return 'Lost item reported successfully!';
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || 'Failed to submit the report.';
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Card className="w-full max-w-2xl border border-slate-800 shadow-2xl p-6 md:p-10 bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 items-center justify-center text-white font-bold text-xl mb-4 shadow shadow-indigo-500/20">
            <FiPlusCircle className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Report a Lost Item</h2>
          <p className="text-sm text-slate-400">Provide accurate details to help recover or return the item.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Item Title"
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
            placeholder="e.g. Blue iPhone 13 Pro Max"
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <select
                name="category"
                value={category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-xl text-slate-200 text-sm outline-none transition-colors cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '16px',
                }}
                disabled={isLoading}
              >
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
            </div>

            <Input
              label="Date Lost"
              type="date"
              name="date"
              value={date}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <Input
            label="Location"
            type="text"
            name="location"
            value={location}
            onChange={handleChange}
            placeholder="e.g. Central Library, 2nd Floor Study Desk"
            required
            disabled={isLoading}
          />

          {/* File Upload Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Item Image</label>
            <div className="flex flex-col gap-3">
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
              <label 
                htmlFor="imageUpload" 
                className="flex items-center justify-center gap-2.5 p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60 rounded-xl cursor-pointer text-slate-300 hover:text-slate-100 font-semibold text-sm transition-all text-center"
              >
                <FiCamera className="w-5 h-5 text-rose-400" />
                <span>{imageFile ? 'Change Selected Image' : 'Choose Image File'}</span>
              </label>

              {imageFile && (
                <div className="text-xs text-slate-400 font-medium px-1 truncate">
                  Selected: {imageFile.name}
                </div>
              )}
            </div>

            {imagePreview && (
              <div className="mt-4 p-4 border border-slate-850 bg-slate-950/60 rounded-2xl flex flex-col items-center gap-3">
                <img src={imagePreview} alt="Upload preview" className="max-h-56 rounded-xl object-contain border border-slate-850" />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRemoveImage}
                  className="text-rose-400 hover:text-rose-300 border-rose-500/20 hover:bg-rose-500/10"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="description">
              Detailed Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={handleChange}
              placeholder="Include details like color, brand, distinct marks..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-200 text-sm outline-none transition-all resize-vertical"
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center py-3" 
              disabled={isLoading}
            >
              Submit Report
            </Button>
            <RouterLink 
              to="/lost-items" 
              className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Lost Items Feed
            </RouterLink>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddLostItem;

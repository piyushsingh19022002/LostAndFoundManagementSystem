import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import API from '../services/api';
import { showSuccess, showError, showWarning, showPromise } from '../utils/toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { FiGift, FiCamera, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const AddFoundItem = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    dateFound: '',
    imageUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { title, description, location, dateFound, imageUrl } = formData;

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!title.trim()) return 'Title is required.';
    if (title.trim().length < 5) return 'Title must be at least 5 characters.';
    if (!description.trim()) return 'Description is required.';
    if (description.trim().length < 10) return 'Description must be at least 10 characters.';
    if (!location.trim()) return 'Location is required.';
    if (!dateFound) return 'Date found is required.';
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

      const response = await API.post('/found-items', finalItemData);
      return response.data;
    };

    showPromise(submitAction(), {
      loading: 'Uploading image and submitting found item report...',
      success: (data) => {
        // Clean up preview URL
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
        }
        setTimeout(() => {
          navigate('/found-items');
        }, 1500);
        return 'Found item reported successfully!';
      },
      error: (err) => {
        setIsLoading(false);
        return err.response?.data?.message || 'Failed to submit the report.';
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 py-8">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Card className="w-full max-w-2xl border border-slate-800 shadow-2xl p-6 md:p-10 bg-slate-900/60 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 items-center justify-center text-white font-bold text-xl mb-4 shadow shadow-emerald-500/20">
            <FiGift className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">Report a Found Item</h2>
          <p className="text-sm text-slate-400">Help reunite someone with their belongings by providing accurate details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Item Title"
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
            placeholder="e.g. Blue Nike Sneakers"
            required
            disabled={isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location Found"
              type="text"
              name="location"
              value={location}
              onChange={handleChange}
              placeholder="e.g. Park study table"
              required
              disabled={isLoading}
            />

            <Input
              label="Date Found"
              type="date"
              name="dateFound"
              value={dateFound}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* File Upload Container */}
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
                <FiCamera className="w-5 h-5 text-emerald-400" />
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
              placeholder="Describe the item in detail — size, colour, brand, markings..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-850 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-slate-200 text-sm outline-none transition-all resize-vertical"
              rows={5}
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center py-3 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10" 
              disabled={isLoading}
            >
              Submit Found Item Report
            </Button>
            <RouterLink 
              to="/found-items" 
              className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Found Items Feed
            </RouterLink>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddFoundItem;

import React, { useState, useEffect } from 'react';
import roomImageService from '../../services/roomImageService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const RoomImageManager = ({ roomId, onImagesChange }) => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchImages();
  }, [roomId]);

  const fetchImages = async () => {
    try {
      const data = await roomImageService.getImages(roomId);
      setImages(data);
      if (onImagesChange) onImagesChange(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('admin.pages.rooms.imageManager.toast.selectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('admin.pages.rooms.imageManager.toast.maxSize'));
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('admin.pages.rooms.imageManager.toast.selectImage'));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('is_primary', images.length === 0 ? '1' : '0');
      formData.append('order', images.length);

      await roomImageService.uploadImage(roomId, formData);
      toast.success(t('admin.pages.rooms.imageManager.toast.uploaded'));
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchImages();
    } catch (error) {
      toast.error(t('admin.pages.rooms.imageManager.toast.uploadError'));
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm(t('admin.pages.rooms.imageManager.confirmDelete'))) return;

    try {
      await roomImageService.deleteImage(roomId, imageId);
      toast.success(t('admin.pages.rooms.imageManager.toast.deleted'));
      fetchImages();
    } catch (error) {
      toast.error(t('admin.pages.rooms.imageManager.toast.deleteError'));
      console.error('Delete error:', error);
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await roomImageService.setPrimary(roomId, imageId);
      toast.success(t('admin.pages.rooms.imageManager.toast.primarySet'));
      fetchImages();
    } catch (error) {
      toast.error(t('admin.pages.rooms.imageManager.toast.primaryError'));
      console.error('Set primary error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{t('admin.pages.rooms.imageManager.title')}</h3>
        
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt={t('admin.pages.rooms.imageManager.previewAlt')}
                className="max-h-64 mx-auto rounded-lg shadow"
              />
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? t('admin.pages.rooms.imageManager.actions.uploading') : t('admin.pages.rooms.imageManager.actions.upload')}
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t('admin.pages.rooms.imageManager.actions.clickToUpload')}
                </label>
                <span className="text-gray-600"> {t('admin.pages.rooms.imageManager.actions.orDragDrop')}</span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {t('admin.pages.rooms.imageManager.fileHint')}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {t('admin.pages.rooms.imageManager.galleryTitle', { value: images.length })}
        </h3>
        
        {images.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {t('admin.pages.rooms.imageManager.empty')}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <img
                  src={image.image_url}
                  alt={`Room ${roomId}`}
                  className="w-full h-48 object-cover"
                />
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {t('admin.pages.rooms.imageManager.primary')}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      title={t('admin.pages.rooms.imageManager.actions.setPrimaryTitle')}
                    >
                      {t('admin.pages.rooms.imageManager.actions.setPrimary')}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    title={t('common.delete')}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomImageManager;

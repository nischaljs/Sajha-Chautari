import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/utils/axiosInterceptor';
import { X } from 'lucide-react';
import React, { ChangeEvent, FormEvent, useState } from 'react';

interface AddAvatarPopupProps {
  onclose: () => void;
}

const AddAvatarPopup: React.FC<AddAvatarPopupProps> = ({ onclose }) => {
  const [avatarName, setAvatarName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    if (!avatarFile) {
      alert('Please select an avatar image');
      return;
    }

    if (!avatarName.trim()) {
      alert('Please enter an avatar name');
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', avatarName);
    formData.append('avatars', avatarFile);

    try {
      // Submit to backend using API interceptor
      const response = await api.post('/admin/avatars',formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });


      alert('Avatar created successfully');
      onclose(); // Close popup on success
    } catch (error) {
      console.error('Avatar upload failed:', error);
      alert('Failed to upload avatar');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-96 relative">
        <button 
          onClick={onclose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Add New Avatar</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="avatarName" className="block mb-2">Avatar Name</label>
            <Input 
              id="avatarName"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              placeholder="Enter avatar name"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="avatarFile" className="block mb-2">Avatar Image</label>
            <input 
              type="file" 
              id="avatarFile"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>

          {previewUrl && (
            <div className="mt-4">
              <p className="mb-2">Preview:</p>
              <img 
                src={previewUrl} 
                alt="Avatar Preview" 
                className="w-32 h-32 object-cover rounded-full mx-auto"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onclose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!avatarFile || !avatarName.trim()}
            >
              Create Avatar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAvatarPopup;
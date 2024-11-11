// app/spaces/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/utils/axiosInterceptor";

interface FormData {
  name: string;
  description: string;
  maxParticipants: number;
  isPublic: boolean;
  thumbnailUrl: string;
}

export default function CreateSpacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    maxParticipants: 25,
    isPublic: true,
    thumbnailUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/spaces", formData);
      console.log(data);
      router.push(`/spaces/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create space");
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? parseInt(value)
            : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Space</h1>
        <p className="mt-2 text-sm text-gray-600">
          Set up your virtual space for collaboration and interaction
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thumbnail URL */}
        <div>
          <label
            htmlFor="thumbnailUrl"
            className="block text-sm font-medium text-gray-700"
          >
            Thumbnail URL
          </label>
          <input
            type="url"
            name="thumbnailUrl"
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
          />
          {formData.thumbnailUrl && (
            <div className="mt-2">
              <img
                src={formData.thumbnailUrl}
                alt="Space thumbnail preview"
                className="h-40 w-40 object-cover rounded-lg"
                onError={() => setError("Invalid image URL")}
              />
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Space Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="My Awesome Space"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe your space..."
          />
        </div>

        {/* Max Participants */}
        <div>
          <label
            htmlFor="maxParticipants"
            className="block text-sm font-medium text-gray-700"
          >
            Maximum Participants
          </label>
          <select
            name="maxParticipants"
            id="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="10">10 participants</option>
            <option value="25">25 participants</option>
            <option value="50">50 participants</option>
            <option value="100">100 participants</option>
          </select>
        </div>

        {/* Privacy Setting */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isPublic"
            id="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isPublic"
            className="ml-2 block text-sm text-gray-700"
          >
            Make this space public
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              "Create Space"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

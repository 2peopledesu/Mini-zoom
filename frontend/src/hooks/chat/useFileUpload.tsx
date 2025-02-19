import { useState, useCallback } from "react";

export const useFileUpload = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadFile = useCallback(
    async (file: File, roomId: string) => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("roomId", roomId);

        const response = await fetch("http://localhost:8080/api/upload", {
          method: "POST",
          headers: {
            "X-User-Id": userId,
          },
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const { imageUrl } = await response.json();
        return imageUrl;
      } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  return {
    uploadFile,
    isLoading,
  };
};

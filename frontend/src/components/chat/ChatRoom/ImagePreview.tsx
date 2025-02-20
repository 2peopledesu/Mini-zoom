import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";

interface ImagePreviewProps {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  open,
  imageUrl,
  onClose,
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const fileName = imageUrl.split("/").pop() || "downloaded-image.jpg";
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogActions sx={{ justifyContent: "space-between", p: 1 }}>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          color="primary"
        >
          Save
        </Button>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogContent sx={{ p: 0 }}>
        <img
          src={imageUrl}
          alt="preview"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;

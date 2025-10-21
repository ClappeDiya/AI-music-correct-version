import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { SharedModelGroup } from "../../types/sharedModel";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (data: Partial<SharedModelGroup>) => void;
}

const CreateModelGroupDialog: React.FC<Props> = ({
  open,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 100,
    batch_size: 32,
    learning_rate: 0.001,
  });
  const theme = useTheme();

  const handleSubmit = () => {
    onCreate({
      name,
      description,
      style_tags: styleTags,
      training_config: trainingConfig,
      is_active: true,
    });
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setStyleTags([]);
    setCurrentTag("");
    setTrainingConfig({
      epochs: 100,
      batch_size: 32,
      learning_rate: 0.001,
    });
  };

  const handleAddTag = () => {
    if (currentTag && !styleTags.includes(currentTag)) {
      setStyleTags([...styleTags, currentTag]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setStyleTags(styleTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Model Group</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            autoFocus
            label="Group Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Style Tags
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <TextField
                label="Add Tag"
                size="small"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!currentTag}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {styleTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2 }}>
            Training Configuration
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Epochs"
                type="number"
                fullWidth
                value={trainingConfig.epochs}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    epochs: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Batch Size"
                type="number"
                fullWidth
                value={trainingConfig.batch_size}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    batch_size: parseInt(e.target.value),
                  })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Learning Rate"
                type="number"
                fullWidth
                value={trainingConfig.learning_rate}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    learning_rate: parseFloat(e.target.value),
                  })
                }
                inputProps={{
                  step: 0.0001,
                  min: 0.0001,
                  max: 1,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim()}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateModelGroupDialog;

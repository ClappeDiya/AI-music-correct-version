import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { SharedModelGroup } from "../../types/sharedModel";
import { sharedModelService } from "../../services/sharedModelService";
import CreateModelGroupDialog from "./CreateModelGroupDialog";

const SharedModelList: React.FC = () => {
  const [groups, setGroups] = useState<SharedModelGroup[]>([]);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const loadedGroups = await sharedModelService.getGroups();
      setGroups(loadedGroups);
    } catch (error) {
      console.error("Failed to load groups:", error);
    }
  };

  const handleCreateGroup = async (groupData: Partial<SharedModelGroup>) => {
    try {
      await sharedModelService.createGroup(groupData);
      setCreateDialogOpen(false);
      loadGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "success";
      case "training":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shared Model Groups
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Group
        </Button>
      </Box>

      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  cursor: "pointer",
                },
              }}
              onClick={() =>
                (window.location.href = `/shared-models/${group.id}`)
              }
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {group.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {group.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`v${group.model_version}`}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={group.training_status}
                    color={getStatusColor(group.training_status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip label={`${group.member_count} members`} size="small" />
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {group.style_tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {group.style_tags.length > 3 && (
                    <Chip
                      label={`+${group.style_tags.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <CreateModelGroupDialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateGroup}
      />
    </Box>
  );
};

export default SharedModelList;

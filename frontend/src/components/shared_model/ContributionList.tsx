import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  MusicNote as MusicIcon,
} from "@mui/icons-material";
import { TrainingContribution } from "../../types/sharedModel";
import { sharedModelService } from "../../services/sharedModelService";

interface Props {
  contributions: TrainingContribution[];
  groupId: number;
  isAdmin: boolean;
  onUpdate: () => void;
}

const ContributionList: React.FC<Props> = ({
  contributions,
  groupId,
  isAdmin,
  onUpdate,
}) => {
  const [selectedContribution, setSelectedContribution] =
    useState<TrainingContribution | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleReview = async (status: "approved" | "rejected") => {
    if (!selectedContribution) return;

    try {
      await sharedModelService.reviewContribution(
        selectedContribution.id,
        status,
        reviewNotes,
      );
      setSelectedContribution(null);
      setReviewNotes("");
      onUpdate();
    } catch (error) {
      console.error("Failed to review contribution:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "warning";
    }
  };

  const renderMobileView = () => (
    <Box>
      {contributions.map((contribution) => (
        <Card key={contribution.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle1">
                {contribution.composition.title}
              </Typography>
              <Chip
                label={contribution.status}
                color={getStatusColor(contribution.status)}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Contributed by: {contribution.contributor.user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {new Date(contribution.contributed_at).toLocaleDateString()}
            </Typography>
            {contribution.review_notes && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Notes: {contribution.review_notes}
              </Typography>
            )}
            {isAdmin && contribution.status === "pending" && (
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<ApproveIcon />}
                  color="success"
                  variant="outlined"
                  onClick={() => setSelectedContribution(contribution)}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  startIcon={<RejectIcon />}
                  color="error"
                  variant="outlined"
                  onClick={() => setSelectedContribution(contribution)}
                >
                  Reject
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Composition</TableCell>
            <TableCell>Contributor</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Notes</TableCell>
            {isAdmin && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {contributions.map((contribution) => (
            <TableRow key={contribution.id}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MusicIcon color="action" />
                  {contribution.composition.title}
                </Box>
              </TableCell>
              <TableCell>{contribution.contributor.user.username}</TableCell>
              <TableCell>
                {new Date(contribution.contributed_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={contribution.status}
                  color={getStatusColor(contribution.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>{contribution.review_notes}</TableCell>
              {isAdmin && (
                <TableCell align="right">
                  {contribution.status === "pending" && (
                    <>
                      <IconButton
                        color="success"
                        onClick={() => setSelectedContribution(contribution)}
                      >
                        <ApproveIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setSelectedContribution(contribution)}
                      >
                        <RejectIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Training Contributions
        </Typography>

        {contributions.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No contributions yet
          </Typography>
        ) : isMobile ? (
          renderMobileView()
        ) : (
          renderDesktopView()
        )}

        <Dialog
          open={!!selectedContribution}
          onClose={() => setSelectedContribution(null)}
        >
          <DialogTitle>Review Contribution</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Review Notes"
              fullWidth
              multiline
              rows={4}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedContribution(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleReview("rejected")}
              color="error"
              variant="contained"
            >
              Reject
            </Button>
            <Button
              onClick={() => handleReview("approved")}
              color="success"
              variant="contained"
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ContributionList;

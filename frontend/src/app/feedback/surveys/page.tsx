"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/useToast";
import { format } from "date-fns";
import { BarChart, ClipboardList, Calendar, Users, Check, Clock } from "lucide-react";

// Sample survey data - this would come from your API in a real implementation
interface Survey {
  id: string;
  title: string;
  description: string;
  category: "feature" | "usability" | "satisfaction" | "interface" | "performance";
  startDate: string; // ISO string
  endDate: string; // ISO string
  status: "active" | "upcoming" | "completed";
  questions: Question[];
  participantsCount: number;
  isCompleted?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "rating" | "text";
  options?: string[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  feature: <ClipboardList className="h-5 w-5 text-blue-500" />,
  usability: <Users className="h-5 w-5 text-purple-500" />,
  satisfaction: <Check className="h-5 w-5 text-green-500" />,
  interface: <BarChart className="h-5 w-5 text-yellow-500" />,
  performance: <Clock className="h-5 w-5 text-red-500" />,
};

const categoryLabels: Record<string, string> = {
  feature: "Feature Feedback",
  usability: "Usability",
  satisfaction: "Satisfaction",
  interface: "Interface",
  performance: "Performance",
};

const sampleSurveys: Survey[] = [
  {
    id: "1",
    title: "Music Generation Feature Satisfaction",
    description: "Help us improve our AI music generation capabilities by sharing your experience with the current features.",
    category: "feature",
    startDate: "2023-06-01T00:00:00Z",
    endDate: "2023-07-01T00:00:00Z",
    status: "active",
    questions: [
      {
        id: "q1",
        text: "How satisfied are you with the variety of music styles available?",
        type: "multiple_choice",
        options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"]
      },
      {
        id: "q2",
        text: "What additional music genres would you like to see?",
        type: "text"
      },
      {
        id: "q3",
        text: "How would you rate the quality of generated music?",
        type: "rating"
      }
    ],
    participantsCount: 342
  },
  {
    id: "2",
    title: "User Interface Improvements",
    description: "We're working on enhancing our user interface. Your feedback will help us make it more intuitive and efficient.",
    category: "interface",
    startDate: "2023-06-15T00:00:00Z",
    endDate: "2023-07-15T00:00:00Z",
    status: "active",
    questions: [
      {
        id: "q1",
        text: "How easy is it to navigate through the application?",
        type: "multiple_choice",
        options: ["Very Easy", "Easy", "Neutral", "Difficult", "Very Difficult"]
      },
      {
        id: "q2",
        text: "What aspects of the interface do you find most confusing?",
        type: "text"
      },
      {
        id: "q3",
        text: "How would you rate the overall visual design?",
        type: "rating"
      }
    ],
    participantsCount: 189
  },
  {
    id: "3",
    title: "Performance and Loading Times",
    description: "Help us identify any performance issues you're experiencing so we can make our platform faster and more responsive.",
    category: "performance",
    startDate: "2023-07-01T00:00:00Z",
    endDate: "2023-08-01T00:00:00Z",
    status: "upcoming",
    questions: [
      {
        id: "q1",
        text: "How would you rate the loading times for music generation?",
        type: "multiple_choice",
        options: ["Very Fast", "Fast", "Average", "Slow", "Very Slow"]
      },
      {
        id: "q2",
        text: "Have you experienced any crashes or freezes? If so, please describe.",
        type: "text"
      },
      {
        id: "q3",
        text: "How satisfied are you with the overall performance of the platform?",
        type: "rating"
      }
    ],
    participantsCount: 0
  },
  {
    id: "4",
    title: "Collaborative Features Feedback",
    description: "We want to know how you use our collaborative music creation features and how we can improve them.",
    category: "feature",
    startDate: "2023-05-01T00:00:00Z",
    endDate: "2023-06-01T00:00:00Z",
    status: "completed",
    questions: [
      {
        id: "q1",
        text: "How often do you use the collaborative features?",
        type: "multiple_choice",
        options: ["Daily", "Weekly", "Monthly", "Rarely", "Never"]
      },
      {
        id: "q2",
        text: "What additional collaborative features would you like to see?",
        type: "text"
      },
      {
        id: "q3",
        text: "How would you rate the ease of collaborating with other users?",
        type: "rating"
      }
    ],
    participantsCount: 567,
    isCompleted: true
  }
];

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>(sampleSurveys);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const activeSurveys = surveys.filter(survey => survey.status === "active");
  const upcomingSurveys = surveys.filter(survey => survey.status === "upcoming");
  const completedSurveys = surveys.filter(survey => survey.status === "completed");
  const mySurveys = surveys.filter(survey => survey.isCompleted);

  const handleStartSurvey = (survey: Survey) => {
    setActiveSurvey(survey);
    setResponses({});
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitSurvey = async () => {
    try {
      setIsSubmitting(true);
      // This would be an API call in a real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark the survey as completed for this user
      setSurveys(prev => 
        prev.map(survey => 
          survey.id === activeSurvey?.id 
            ? { ...survey, isCompleted: true, participantsCount: survey.participantsCount + 1 } 
            : survey
        )
      );
      
      setActiveSurvey(null);
      toast({
        title: "Survey Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCompletionPercentage = (survey: Survey) => {
    if (!activeSurvey) return 0;
    return Object.keys(responses).length / survey.questions.length * 100;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  if (activeSurvey) {
    return (
      <div className="container py-8">
        <Button 
          onClick={() => setActiveSurvey(null)} 
          variant="ghost" 
          className="mb-4"
        >
          ← Back to Surveys
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{activeSurvey.title}</CardTitle>
                <CardDescription className="mt-2">{activeSurvey.description}</CardDescription>
              </div>
              <Badge className="text-sm">
                {categoryLabels[activeSurvey.category]}
              </Badge>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Available until {formatDate(activeSurvey.endDate)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {activeSurvey.questions.map((question, index) => (
              <div key={question.id} className="space-y-4">
                <h3 className="text-lg font-medium">
                  {index + 1}. {question.text}
                </h3>
                
                {question.type === "multiple_choice" && (
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                  >
                    <div className="space-y-2">
                      {question.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
                
                {question.type === "text" && (
                  <Textarea
                    value={responses[question.id] || ""}
                    onChange={(e) => handleResponseChange(question.id, e.target.value)}
                    placeholder="Enter your response here..."
                    className="min-h-[100px]"
                  />
                )}
                
                {question.type === "rating" && (
                  <RadioGroup
                    value={responses[question.id] || ""}
                    onValueChange={(value) => handleResponseChange(question.id, value)}
                    className="flex space-x-4"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex flex-col items-center">
                        <RadioGroupItem
                          value={rating.toString()}
                          id={`${question.id}-${rating}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`${question.id}-${rating}`}
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                            responses[question.id] === rating.toString()
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted hover:border-primary hover:text-primary"
                          } cursor-pointer text-lg font-medium transition-colors`}
                        >
                          {rating}
                        </Label>
                        <span className="mt-1 text-xs">
                          {rating === 1
                            ? "Poor"
                            : rating === 2
                            ? "Fair"
                            : rating === 3
                            ? "Good"
                            : rating === 4
                            ? "Very Good"
                            : "Excellent"}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}

            <div className="pt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Completion</span>
                <span>{Math.round(calculateCompletionPercentage(activeSurvey))}%</span>
              </div>
              <Progress value={calculateCompletionPercentage(activeSurvey)} className="h-2" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveSurvey(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSurvey} 
              disabled={isSubmitting || Object.keys(responses).length !== activeSurvey.questions.length}
            >
              {isSubmitting ? "Submitting..." : "Submit Survey"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surveys</h1>
          <p className="text-muted-foreground mt-1">
            Help us improve our platform by participating in these short surveys
          </p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Surveys</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="my">My Responses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          {activeSurveys.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey} 
                    onStart={handleStartSurvey} 
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">No active surveys at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingSurveys.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey} 
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">No upcoming surveys at the moment.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {completedSurveys.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedSurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey} 
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">No completed surveys.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my" className="space-y-4">
          {mySurveys.length > 0 ? (
            <ScrollArea className="h-[600px]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySurveys.map((survey) => (
                  <SurveyCard 
                    key={survey.id} 
                    survey={survey} 
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center h-40 border rounded-md">
              <p className="text-muted-foreground">You haven't completed any surveys yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SurveyCardProps {
  survey: Survey;
  onStart?: (survey: Survey) => void;
}

function SurveyCard({ survey, onStart }: SurveyCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge 
            variant="secondary" 
            className="mb-2"
          >
            {categoryLabels[survey.category]}
          </Badge>
          {survey.status === "active" && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </Badge>
          )}
          {survey.status === "upcoming" && (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Upcoming
            </Badge>
          )}
          {survey.status === "completed" && (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl font-semibold line-clamp-2">{survey.title}</CardTitle>
        <CardDescription className="line-clamp-3 mt-2">
          {survey.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{format(new Date(survey.startDate), "MMM d")} - {format(new Date(survey.endDate), "MMM d, yyyy")}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4 mr-1" />
          <span>{survey.participantsCount} participants</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <ClipboardList className="h-4 w-4 mr-1" />
          <span>{survey.questions.length} questions</span>
        </div>
      </CardContent>
      <CardFooter>
        {survey.status === "active" && !survey.isCompleted && onStart && (
          <Button 
            onClick={() => onStart(survey)} 
            className="w-full"
          >
            Take Survey
          </Button>
        )}
        {survey.status === "upcoming" && (
          <Button 
            disabled 
            className="w-full"
          >
            Available {format(new Date(survey.startDate), "MMM d")}
          </Button>
        )}
        {(survey.status === "completed" || survey.isCompleted) && (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            Survey Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 
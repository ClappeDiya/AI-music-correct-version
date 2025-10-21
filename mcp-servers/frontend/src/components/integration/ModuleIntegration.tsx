"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChevronLeft, 
  ChevronRight, 
  CornerUpLeft, 
  Loader2, 
  ExternalLink,
  Presentation 
} from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { useCreativeParameters } from '@/hooks/useCreativeParameters';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import Link from 'next/link';

interface ModuleIntegrationProps {
  moduleName: string;
  children: React.ReactNode;
  onParametersReceived?: (params: Record<string, any>) => void;
  onParametersShared?: (params: Record<string, any>) => void;
}

/**
 * Provides integration features for existing module pages including:
 * - Project context awareness
 * - Navigation between modules with context preservation
 * - Parameter sharing between modules
 * - Suggestions for next steps
 */
export function ModuleIntegration({
  moduleName,
  children,
  onParametersReceived,
  onParametersShared
}: ModuleIntegrationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, navigateToModule, getSuggestedNextSteps } = useProject();
  const { getCompatibleParameters, getRecommendedParameters } = useCreativeParameters();
  
  const [isInProjectContext, setIsInProjectContext] = useState(false);
  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check if we're operating within a project context
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    setIsInProjectContext(!!projectId && projectId === project.id);
    
    // If we have incoming parameters, process them
    if (isInProjectContext && onParametersReceived && !isInitialized) {
      // Get module state from project if it exists
      if (project.moduleStates[moduleName]) {
        onParametersReceived(project.moduleStates[moduleName]);
      }
      
      // Get recommended parameters based on project state
      const recommendedParams = getRecommendedParameters(moduleName);
      if (Object.keys(recommendedParams).length > 0) {
        onParametersReceived(recommendedParams);
      }
      
      setIsInitialized(true);
    }
  }, [
    searchParams, 
    project.id, 
    project.moduleStates, 
    moduleName, 
    onParametersReceived, 
    getRecommendedParameters,
    isInProjectContext,
    isInitialized
  ]);
  
  // Get suggestions for next steps
  const suggestions = getSuggestedNextSteps().filter(
    suggestion => suggestion.module !== moduleName
  ).slice(0, 2);
  
  // Create previous and next module navigation
  const moduleOrder = [
    'mood_music',
    'ai_music',
    'lyrics',
    'voice_cloning',
    'virtual_studio',
    'genre_mixing',
    'ai_dj'
  ];
  
  const currentModuleIndex = moduleOrder.indexOf(moduleName);
  const prevModule = currentModuleIndex > 0 ? moduleOrder[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < moduleOrder.length - 1 ? moduleOrder[currentModuleIndex + 1] : null;
  
  // Function to navigate to another module with compatible parameters
  const navigateWithCompatibleParams = (targetModule: string) => {
    if (onParametersShared) {
      // Let the current module provide parameters to share
      onParametersShared({});
    }
    
    // Get compatible parameters between this module and the target
    const compatibleParams = getCompatibleParameters(moduleName, targetModule);
    
    // Navigate to the target module
    navigateToModule(targetModule, compatibleParams);
  };
  
  return (
    <div className="space-y-4">
      {/* Show project context header if within a project */}
      {isInProjectContext && (
        <Card className="bg-primary-foreground border-primary/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-primary" />
                <span className="font-medium">Project: {project.title}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                >
                  <Link href={`/project/dashboard?projectId=${project.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                </Button>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsShowingSuggestions(!isShowingSuggestions)}
                    >
                      <ChevronRight className={`h-4 w-4 transition-transform ${isShowingSuggestions ? 'rotate-90' : ''}`} />
                      Next Steps
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Show suggested next steps
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Show suggestions when expanded */}
            {isShowingSuggestions && suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-background">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 px-4">
                      <p className="text-xs text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </CardContent>
                    <CardFooter className="py-3 px-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigateWithCompatibleParams(suggestion.module)}
                      >
                        <ChevronRight className="h-3 w-3 mr-1" />
                        Continue
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Module content */}
      <div className="relative">
        {children}
      </div>
      
      {/* Module navigation */}
      {isInProjectContext && (
        <div className="flex justify-between mt-8 pt-4 border-t">
          {prevModule ? (
            <Button 
              variant="outline" 
              onClick={() => navigateWithCompatibleParams(prevModule)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous: {prevModule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => router.push(`/project/dashboard?projectId=${project.id}`)}
          >
            <CornerUpLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          {nextModule ? (
            <Button 
              variant="default" 
              onClick={() => navigateWithCompatibleParams(nextModule)}
            >
              Next: {nextModule.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div></div>
          )}
        </div>
      )}
    </div>
  );
} 
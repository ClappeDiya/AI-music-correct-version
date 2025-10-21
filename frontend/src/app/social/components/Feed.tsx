"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Skeleton } from "@/components/ui/Skeleton";
import useSWR from "swr";
import { Post } from "../types";

// Define a fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Feed() {
  // Use the fetcher function with useSWR
  const { data: posts, isLoading } = useSWR("/api/social/posts", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} variant="outline">
            <CardHeader spacing="sm">
              <Skeleton className="h-6 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {posts?.map((post) => (
        <Card key={post.id} variant="outline">
          <CardHeader
            spacing="sm"
            className="flex flex-row items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <Button variant="ghost" size="sm">
              Follow
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{post.content}</p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="ghost" size="sm">
              Like
            </Button>
            <Button variant="ghost" size="sm">
              Comment
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

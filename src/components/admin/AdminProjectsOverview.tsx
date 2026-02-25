import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  Plus,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "planning" | "completed" | "on_hold";
  priority: "high" | "medium" | "low";
  progress: number;
  startDate: string;
  endDate: string;
  team: { name: string; avatar?: string }[];
  tasks: { completed: number; total: number };
}

const projects: Project[] = [
  {
    id: "1",
    name: "Mobile App Redesign",
    description: "Complete UI/UX overhaul of the customer mobile application",
    status: "active",
    priority: "high",
    progress: 68,
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    team: [
      { name: "Sarah J" },
      { name: "Mike C" },
      { name: "Emily D" },
    ],
    tasks: { completed: 24, total: 35 },
  },
  {
    id: "2",
    name: "Austin Market Launch",
    description: "Expansion to Austin, TX market with driver recruitment",
    status: "active",
    priority: "high",
    progress: 45,
    startDate: "2024-01-15",
    endDate: "2024-02-28",
    team: [
      { name: "John W" },
      { name: "Lisa P" },
    ],
    tasks: { completed: 12, total: 28 },
  },
  {
    id: "3",
    name: "Payment Gateway Migration",
    description: "Migrate to new payment processor for reduced fees",
    status: "planning",
    priority: "medium",
    progress: 15,
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    team: [
      { name: "Alex T" },
    ],
    tasks: { completed: 3, total: 20 },
  },
  {
    id: "4",
    name: "Driver App v3.0",
    description: "Major feature release with offline mode and voice",
    status: "active",
    priority: "medium",
    progress: 82,
    startDate: "2023-11-01",
    endDate: "2024-02-15",
    team: [
      { name: "David K" },
      { name: "Rachel G" },
      { name: "Tom H" },
      { name: "Anna M" },
    ],
    tasks: { completed: 41, total: 50 },
  },
  {
    id: "5",
    name: "AI Demand Prediction",
    description: "ML model for demand forecasting and surge pricing",
    status: "on_hold",
    priority: "low",
    progress: 25,
    startDate: "2023-10-01",
    endDate: "2024-06-30",
    team: [
      { name: "Chris L" },
    ],
    tasks: { completed: 8, total: 32 },
  },
];

const statusConfig = {
  active: { color: "text-green-500", bg: "bg-green-500/10", label: "Active" },
  planning: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Planning" },
  completed: { color: "text-primary", bg: "bg-primary/10", label: "Completed" },
  on_hold: { color: "text-amber-500", bg: "bg-amber-500/10", label: "On Hold" },
};

const priorityConfig = {
  high: { color: "text-red-500", bg: "bg-red-500/10" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10" },
  low: { color: "text-slate-500", bg: "bg-slate-500/10" },
};

const AdminProjectsOverview = () => {
  const activeProjects = projects.filter(p => p.status === "active").length;
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            Projects Overview
          </h2>
          <p className="text-muted-foreground mt-1">Track initiatives and team progress</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10">
                <TrendingUp className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Due This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid gap-4">
        {projects.map((project, index) => {
          const status = statusConfig[project.status];
          const priority = priorityConfig[project.priority];

          return (
            <Card 
              key={project.id}
              className="border-0 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge className={cn("text-[10px] h-4", status.bg, status.color)}>
                        {status.label}
                      </Badge>
                      <Badge className={cn("text-[10px] h-4 capitalize", priority.bg, priority.color)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 4).map((member, i) => (
                          <Avatar key={i} className="h-7 w-7 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-muted">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 4 && (
                          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-background">
                            +{project.team.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.team.length} members
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress value={project.progress} className="h-2 flex-1" />
                      <span className="text-xs font-medium w-10 text-right">{project.progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                      <p className="text-[10px] text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Deadline</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>View Tasks</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminProjectsOverview;

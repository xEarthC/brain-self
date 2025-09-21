import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  Zap, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Advanced AI assistant to help with studies, generate notes, and answer questions',
      color: 'text-primary'
    },
    {
      icon: BookOpen,
      title: 'Interactive Courses',
      description: 'Comprehensive courses with video content and hands-on exercises',
      color: 'text-accent'
    },
    {
      icon: MessageSquare,
      title: 'Smart Tutoring',
      description: 'Get instant help with homework and complex topics',
      color: 'text-secondary'
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Earn badges and track your learning progress',
      color: 'text-primary'
    }
  ];

  const benefits = [
    'Personalized learning paths adapted to your pace',
    'Real-time progress tracking and analytics',
    'Interactive tests and quizzes with instant feedback',
    'Multi-language support (English & Sinhala)',
    'Teacher dashboard for educators',
    'Mobile-friendly responsive design'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge className="neon-glow text-sm px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              The Future of Learning
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text">
              Master Any Subject with
              <br />
              <span className="text-primary">AI-Powered Learning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of education with our intelligent learning platform. 
              Get personalized tutoring, interactive courses, and instant feedback.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="neon-glow text-lg px-8 py-3">
              <Link to="/auth">
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-glow text-lg px-8 py-3">
              <Link to="/ai-assistant">
                Try AI Assistant
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-accent" />
              <span>1000+ Students</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-secondary" />
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Why Choose BrainSelf?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines cutting-edge AI technology with proven educational methods 
            to deliver an unmatched learning experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="glass-effect neon-border hover-glow">
              <CardHeader className="text-center">
                <div className={`mx-auto p-3 rounded-full bg-primary/10 w-fit`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground">
              Our comprehensive platform provides all the tools and resources you need 
              to excel in your studies and achieve your academic goals.
            </p>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <Button asChild size="lg" className="neon-glow">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <Card className="glass-effect neon-border p-8">
              <div className="text-center space-y-4">
                <Brain className="h-16 w-16 mx-auto text-primary" />
                <h3 className="text-2xl font-bold gradient-text">AI Learning Assistant</h3>
                <p className="text-muted-foreground">
                  Get instant help with homework, generate study notes from PDFs, 
                  and receive personalized explanations tailored to your learning style.
                </p>
                <Button asChild variant="outline" className="hover-glow">
                  <Link to="/ai-assistant">Try Now - It's Free!</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="glass-effect neon-border">
          <CardContent className="p-12 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of students who are already experiencing the future of education. 
                Start your journey today with our free AI assistant.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="neon-glow text-lg px-8 py-3">
                  <Link to="/auth">
                    <Zap className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="hover-glow text-lg px-8 py-3">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Index;
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Edit3, Bookmark, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <Layout  >
     
      {/* Story Section */}
      <section className="py-12 bg-primary/10 pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-display font-semibold  mb-6">Our <span className="text-primary">Recipes</span></h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Savory was born from a passion for food and a desire to connect people through the universal language of cooking. 
              Founded by a group of home chefs and food enthusiasts, our platform started as a simple recipe exchange among friends 
              and has grown into a thriving community of millions. We believe that every kitchen tells a story, and we're here to help you share yours.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  To inspire creativity in the kitchen and foster a global community of food lovers who celebrate diversity in flavors and traditions.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  A world where everyone can access, create, and enjoy recipes that reflect their culture, preferences, and imagination, making cooking accessible and fun for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-display font-semibold text-gray-900 mb-4">Why Choose Savory?</h2>
            <p className="text-lg text-muted-foreground">Discover features that make cooking effortless and enjoyable</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center shadow-sm">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Search & Discover</CardTitle>
                <CardDescription>Browse thousands of recipes from our vibrant community, tailored to your tastes.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center shadow-sm">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Edit3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Create Your Own</CardTitle>
                <CardDescription>Easily create and share your recipes with step-by-step guides and photos.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center shadow-sm">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Bookmark & Organize</CardTitle>
                <CardDescription>Save favorites and organize them into custom folders for quick access.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center shadow-sm">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">Join the Community</CardTitle>
                <CardDescription>Connect with fellow foodies, share tips, and get inspired by others' creations.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-display font-semibold text-gray-900 mb-4">Ready to Start Cooking?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join Savory today and embark on your culinary adventure with a world of recipes at your fingertips.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">
                Sign Up Free
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/search">
                Browse Recipes
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
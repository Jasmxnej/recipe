import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRecipes } from '../contexts/RecipeContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import { Plus, Save, Trash2 } from 'lucide-react';

interface Ingredient {
  id: string;
  quantity: string;
  part: string;
}

interface Instruction {
  id: string;
  value: string;
}

const CreateRecipePage = () => {
  const { user } = useAuth();
  const { addRecipe } = useRecipes();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Main Course',
    prepTime: '15',
    cookTime: '30',
    servings: '4',
    keywords: '',
    recipeYield: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: Date.now().toString(), quantity: '', part: '' }]);
  const [instructions, setInstructions] = useState<Instruction[]>([{ id: Date.now().toString() + 1, value: '' }]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (id: string, field: 'quantity' | 'part', value: string) => {
    setIngredients(ingredients.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const handleInstructionChange = (id: string, value: string) => {
    setInstructions(instructions.map(inst => inst.id === id ? { ...inst, value } : inst));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), quantity: '', part: '' }]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
    }
  };

  const addInstruction = () => {
    setInstructions([...instructions, { id: Date.now().toString(), value: '' }]);
  };

  const removeInstruction = (id: string) => {
    if (instructions.length > 1) {
      setInstructions(instructions.filter(inst => inst.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) {
        toast.error('You must be logged in to create a recipe.');
        return;
      }

      const ingredientQuantities = ingredients.filter(ing => ing.part.trim()).map(ing => ing.quantity.trim());
      const ingredientParts = ingredients.filter(ing => ing.part.trim()).map(ing => ing.part.trim());
      const instructionsList = instructions.filter(inst => inst.value.trim()).map(inst => inst.value.trim());

      if (ingredientParts.length === 0 || instructionsList.length === 0) {
        toast.error('Please add at least one ingredient and one instruction.');
        return;
      }

      const prepTime = parseInt(formData.prepTime) || 0;
      const cookTime = parseInt(formData.cookTime) || 0;
      const servings = parseInt(formData.servings) || 4;

      let imageData = '';
      if (imageFile) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const result = await addRecipe({
        name: formData.name,
        description: formData.description,
        instructions: instructionsList.join('\n'),
        category: formData.category,
        authorId: user.id,
        authorName: user.name,
        prepTime,
        cookTime,
        servings,
        keywords: formData.keywords,
        imageUrl: imageData,
        recipeYield: formData.recipeYield,
        ingredientQuantities,
        ingredientParts,
      });

      toast.success('Recipe created successfully!');
      navigate(`/recipe/${result.newId}`);
    } catch (error) {
      toast.error('Failed to create recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout >
        <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12">
        <h1 className="text-5xl font-display font-semibold text-black mb-20 mt-20 text-center">Create Your Recipe</h1>
          <div className="container px-4 mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-sm rounded-xl">
               
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="name">Recipe Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Grandma's Chocolate Cake"
                        required
                        className="text-lg py-4"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your recipe in a few words..."
                        rows={4}
                        required
                        className="text-base py-3"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="text-base py-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Course">Main Course</SelectItem>
                          <SelectItem value="Dessert">Dessert</SelectItem>
                          <SelectItem value="Side Dish">Side Dish</SelectItem>
                          <SelectItem value="Appetizer">Appetizer</SelectItem>
                          <SelectItem value="Breakfast">Breakfast</SelectItem>
                          <SelectItem value="Salad">Salad</SelectItem>
                          <SelectItem value="Soup">Soup</SelectItem>
                          <SelectItem value="Snack">Snack</SelectItem>
                          <SelectItem value="Frozen Desserts">Frozen Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                        <Input
                          id="prepTime"
                          name="prepTime"
                          type="number"
                          min="0"
                          value={formData.prepTime}
                          onChange={handleInputChange}
                          placeholder="15"
                          required
                          className="text-base py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                        <Input
                          id="cookTime"
                          name="cookTime"
                          type="number"
                          min="0"
                          value={formData.cookTime}
                          onChange={handleInputChange}
                          placeholder="30"
                          required
                          className="text-base py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="servings">Servings</Label>
                        <Input
                          id="servings"
                          name="servings"
                          type="number"
                          min="1"
                          value={formData.servings}
                          onChange={handleInputChange}
                          placeholder="4"
                          required
                          className="text-base py-3"
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        name="keywords"
                        value={formData.keywords}
                        onChange={handleInputChange}
                        placeholder="e.g., healthy, quick, vegan"
                        className="text-base py-3"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="image">Image Upload</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="text-base py-3"
                      />
                      {imageFile && <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="recipeYield">Recipe Yield (optional)</Label>
                      <p className="text-sm text-gray-500">e.g., 1 loaf, 12 cookies, 1 batch (separate from servings)</p>
                      <Input
                        id="recipeYield"
                        name="recipeYield"
                        value={formData.recipeYield}
                        onChange={handleInputChange}
                        placeholder="e.g., 1 loaf"
                        className="text-base py-3"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Ingredients</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Ingredient
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {ingredients.map((ingredient, index) => (
                          <motion.div
                            key={ingredient.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-md p-3 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Ingredient #{index + 1}</span>
                              {ingredients.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredient(ingredient.id)}
                                  className="h-8 w-8 p-0 -mr-3"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs font-medium block mb-1">Quantity</Label>
                                <Input
                                  value={ingredient.quantity}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'quantity', e.target.value)}
                                  placeholder="e.g., 2 cups"
                                  className="text-sm py-2"
                                />
                              </div>
                              <div>
                                <Label className="text-xs font-medium block mb-1">Name</Label>
                                <Input
                                  value={ingredient.part}
                                  onChange={(e) => handleIngredientChange(ingredient.id, 'part', e.target.value)}
                                  placeholder="e.g., all-purpose flour"
                                  className="text-sm py-2"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium">Instructions</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Step
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {instructions.map((instruction, index) => (
                          <motion.div
                            key={instruction.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border rounded-md p-3 bg-gray-50"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Step #{index + 1}</span>
                              {instructions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeInstruction(instruction.id)}
                                  className="h-8 w-8 p-0 -mr-3"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <Textarea
                              value={instruction.value}
                              onChange={(e) => handleInstructionChange(instruction.id, e.target.value)}
                              placeholder={`Describe step ${index + 1}, e.g., Preheat oven to 350°F (175°C) and mix ingredients.`}
                              rows={4}
                              className="resize-none text-sm py-2"
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="flex justify-end pt-6"
                    >
                      <Button type="submit" disabled={loading} className="gap-2 px-8 py-3 text-base">
                        <Save className="h-4 w-4" />
                        {loading ? 'Creating...' : 'Create Recipe'}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default CreateRecipePage;

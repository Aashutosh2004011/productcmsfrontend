'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  LogOut, 
  User, 
  Mail, 
  Calendar, 
  Clock,
  Shield,
  Activity,
  Package,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
  Eye,
  Archive
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { api } from '@/lib/axios';

// Updated types to match your database schema
interface Product {
  product_id: number;
  product_name: string;
  product_desc?: string;
  status: 'Draft' | 'Published' | 'Archived';
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
  is_deleted: boolean;
}

interface ProductFormData {
  product_name: string;
  product_desc: string;
  status: 'Draft' | 'Published' | 'Archived';
  created_by?: string;
}

// Dashboard stats interface
interface DashboardStats {
  total: number;
  draft: number;
  published: number;
  archived: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    product_name: '',
    product_desc: '',
    status: 'Draft'
  });

  // Calculate stats from products
  const calculateStats = (productsData: Product[]): DashboardStats => {
    const activeProducts = productsData.filter(p => !p.is_deleted);
    return {
      total: activeProducts.length,
      draft: activeProducts.filter(p => p.status === 'Draft').length,
      published: activeProducts.filter(p => p.status === 'Published').length,
      archived: activeProducts.filter(p => p.status === 'Archived').length
    };
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      const productsData = response.data;
      setProducts(productsData);
      setStats(calculateStats(productsData));
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const createProduct = async (productData: ProductFormData) => {
    try {
      setFormSubmitting(true);
      const payload = {
        ...productData,
        created_by: user?._id || 'admin'
      };
      const response = await api.post('/products', payload);
      const newProduct = response.data;
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      setStats(calculateStats(updatedProducts));
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
      setError('Failed to create product. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Update product
  const updateProduct = async (product_id: number, productData: ProductFormData) => {
    try {
      setFormSubmitting(true);
      const payload = {
        ...productData,
        updated_by: user?._id || 'admin'
      };
      await api.put(`/products/${product_id}`, payload);
      const updatedProducts = products.map(p => 
        p.product_id === product_id 
          ? { ...p, ...payload, updated_at: new Date().toISOString() } 
          : p
      );
      setProducts(updatedProducts);
      setStats(calculateStats(updatedProducts));
      resetForm();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete product (soft delete)
  const deleteProduct = async (product_id: number) => {
    try {
      await api.delete(`/products/${product_id}`, {
        data: { updated_by: user?._id || 'admin' }
      });
      const updatedProducts = products.map(p => 
        p.product_id === product_id ? { ...p, is_deleted: true } : p
      );
      setProducts(updatedProducts);
      setStats(calculateStats(updatedProducts));
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  // Form handlers
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_desc: '',
      status: 'Draft'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.product_id, formData);
    } else {
      await createProduct(formData);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_desc: product.product_desc || '',
      status: product.status
    });
    setIsEditDialogOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'border-yellow-500 text-yellow-400';
      case 'Published':
        return 'border-green-500 text-green-400';
      case 'Archived':
        return 'border-gray-500 text-gray-400';
      default:
        return 'border-slate-500 text-slate-400';
    }
  };

  // Filter active products for display
  const activeProducts = products.filter(p => !p.is_deleted);

  // Load data on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Product Dashboard</h1>
                <p className="text-slate-400 text-sm">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-green-500 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Product Management Dashboard
          </h2>
          <p className="text-slate-400">
            Manage your inventory and track product performance.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="mb-6 border-red-500/20 bg-red-500/10">
            <CardContent className="flex items-center space-x-2 pt-6">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
              <Button
                onClick={() => setError(null)}
                variant="ghost"
                size="sm"
                className="ml-auto text-red-400 hover:bg-red-500/20"
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Total Products</CardTitle>
              <Package className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <p className="text-xs text-blue-400/70">Active products</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">Draft</CardTitle>
              <FileText className="w-4 h-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.draft}</div>
              <p className="text-xs text-yellow-400/70">Draft products</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Published</CardTitle>
              <Eye className="w-4 h-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.published}</div>
              <p className="text-xs text-green-400/70">Published products</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Archived</CardTitle>
              <Archive className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.archived}</div>
              <p className="text-xs text-gray-400/70">Archived products</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & User Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Profile Card */}
          <Card className="lg:col-span-1 bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">Administrator</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
                
                {user.age && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">Age: {user.age}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Product management tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-24 flex-col space-y-2 border-slate-700 hover:bg-slate-800"
                      onClick={resetForm}
                    >
                      <Plus className="w-6 h-6" />
                      <span>Add Product</span>
                    </Button>
                  </DialogTrigger>
                  <ProductFormDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    isSubmitting={formSubmitting}
                    title="Add New Product"
                  />
                </Dialog>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col space-y-2 border-slate-700 hover:bg-slate-800"
                  onClick={fetchProducts}
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                  <span>Refresh Data</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col space-y-2 border-slate-700 hover:bg-slate-800"
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>Analytics</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col space-y-2 border-slate-700 hover:bg-slate-800"
                >
                  <Settings className="w-6 h-6" />
                  <span>Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Products Inventory</CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-400">Loading products...</span>
              </div>
            ) : activeProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
                <p className="text-slate-400 mb-6">Get started by adding your first product to the inventory.</p>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </DialogTrigger>
                  <ProductFormDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    isSubmitting={formSubmitting}
                    title="Add New Product"
                  />
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {activeProducts.map((product) => (
                  <div 
                    key={product.product_id}
                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white text-lg">{product.product_name}</h4>
                          {product.product_desc && (
                            <p className="text-sm text-slate-400 mt-1">{product.product_desc}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-3">
                            <Badge variant="outline" className={getStatusBadgeColor(product.status)}>
                              {product.status}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              Created: {new Date(product.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-slate-500">
                              Updated: {new Date(product.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 hover:bg-slate-700"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                        onClick={() => deleteProduct(product.product_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <ProductFormDialog
            isOpen={isEditDialogOpen}
            onClose={() => {
              setIsEditDialogOpen(false);
              setEditingProduct(null);
              resetForm();
            }}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isSubmitting={formSubmitting}
            title="Edit Product"
          />
        </Dialog>
      </main>
    </div>
  );
}

// Product Form Dialog Component
interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  title: string;
}

function ProductFormDialog({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  onSubmit, 
  isSubmitting, 
  title 
}: ProductFormDialogProps) {
  return (
    <DialogContent className="bg-slate-900 border-slate-800">
      <DialogHeader>
        <DialogTitle className="text-white">{title}</DialogTitle>
        <DialogDescription>
          Fill in the product details below.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-200">Product Name</Label>
          <Input
            id="name"
            value={formData.product_name}
            onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status" className="text-slate-200">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: 'Draft' | 'Published' | 'Archived') => 
              setFormData({ ...formData, status: value })
            }
            required
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="Draft" className="text-white hover:bg-slate-700">
                Draft
              </SelectItem>
              <SelectItem value="Published" className="text-white hover:bg-slate-700">
                Published
              </SelectItem>
              <SelectItem value="Archived" className="text-white hover:bg-slate-700">
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="product_desc" className="text-slate-200">Description</Label>
          <Textarea
            id="product_desc"
            value={formData.product_desc}
            onChange={(e) => setFormData({ ...formData, product_desc: e.target.value })}
            className="bg-slate-800 border-slate-700 text-white"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
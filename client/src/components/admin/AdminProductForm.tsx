import { useState, useEffect, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus, Trash2 } from "lucide-react"

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product?: Product | null;
  isSaving: boolean;
}

const categories = ["spiritual", "crystals", "jewelry", "books", "accessories"];
const initialFormData = {
  name: '',
  description: '',
  price: '',
  discountedPrice: '',
  category: '',
  stock: 0,
  isActive: true,
  specifications: [] as { key: string; value: string }[],
};


export default function ProductFormModal({ isOpen, onClose, onSubmit, product, isSaving }: ProductFormModalProps) {
  const [formData, setFormData] = useState(initialFormData);
  
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
  
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        discountedPrice: product.discountedPrice || '',
        category: product.category,
        stock: product.stock,
        isActive: product.isActive,
        specifications: (product.specifications as any[]) || [],
      });
      setExistingImageUrls(product.imageUrls || []);
      setFiles([]);
    } else {
      setFormData(initialFormData); // Reset form for new product
      setExistingImageUrls([]);
      setFiles([]);
    }
  }, [product, isOpen]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value, type } = e.target;
  
  setFormData(prev => {
    let processedValue: string | number = value;
    
    if (type === 'number') {
      const parsed = parseInt(value, 10);
      processedValue = isNaN(parsed) ? 0 : parsed;
    }
    
    return { ...prev, [name]: processedValue };
  });
};
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const removeFile = (fileToRemove: File | string) => {
    if (typeof fileToRemove === 'string') {
      setExistingImageUrls(prev => prev.filter(url => url !== fileToRemove));
    } else {
      setFiles(prev => prev.filter(file => file !== fileToRemove));
    }
  }

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };
  const addSpec = () => setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { key: '', value: '' }] }));
  const removeSpec = (index: number) => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== index) }));
  const handleSubmit = () => {
    const submitFormData = new FormData();
    // Append fields from the state object
    submitFormData.append('name', formData.name);
    submitFormData.append('description', formData.description);
    submitFormData.append('price', formData.price);
    submitFormData.append('discountedPrice', formData.discountedPrice);
    submitFormData.append('category', formData.category);
    submitFormData.append('stock', String(formData.stock));
    submitFormData.append('isActive', String(formData.isActive));
    submitFormData.append('specifications', JSON.stringify(formData.specifications));
    
    submitFormData.append('existingImageUrls', JSON.stringify(existingImageUrls));
    files.forEach(file => {
      submitFormData.append('images', file);
    });

    console.log("Submitting form data:", { ...formData, existingImageUrls, newFilesCount: files.length });

    onSubmit(submitFormData);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div><Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={handleSelectChange}>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label htmlFor="price">Price (₹)</Label><Input id="price" name="price" value={formData.price} onChange={handleChange} /></div>
            <div><Label htmlFor="discountedPrice">Discounted Price (₹)</Label><Input id="discountedPrice" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} placeholder="Optional"/></div>
            <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} /></div>
          </div>
          <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-border'}`}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some images here, or click to select files (Max 10)</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {[...existingImageUrls, ...files].map((file, index) => (
                <div key={index} className="relative w-24 h-24">
                    <img src={typeof file === 'string' ? file : file.preview} className="w-full h-full object-cover rounded-md" />
                    <button onClick={() => removeFile(file)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X size={12}/></button>
                </div>
            ))}
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="isActive">Product Active</Label>
          </div>

          <div>
            <Label>Specifications</Label>
            <div className="space-y-2 mt-2">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input placeholder="e.g., Color" value={spec.key} onChange={(e) => handleSpecChange(index, 'key', e.target.value)} />
                  <Input placeholder="e.g., Red" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => removeSpec(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSpec}><Plus className="w-4 h-4 mr-2" />Add Specification</Button>
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
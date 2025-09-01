"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function TestInputsPage() {
  const [precioHora, setPrecioHora] = useState(200);
  const [precioDia, setPrecioDia] = useState(1500);
  const [precioMes, setPrecioMes] = useState(30000);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setUploadedImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">Página de Prueba - Inputs</h1>
        
        {/* Prueba de Inputs de Precio */}
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Inputs de Precio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Precio por hora</label>
                <Input 
                  type="number" 
                  value={precioHora}
                  onChange={(e) => setPrecioHora(Number(e.target.value))}
                  placeholder="200"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor actual: {precioHora}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio por día</label>
                <Input 
                  type="number" 
                  value={precioDia}
                  onChange={(e) => setPrecioDia(Number(e.target.value))}
                  placeholder="1500"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor actual: {precioDia}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Precio por mes</label>
                <Input 
                  type="number" 
                  value={precioMes}
                  onChange={(e) => setPrecioMes(Number(e.target.value))}
                  placeholder="30000"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor actual: {precioMes}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Instrucciones de Prueba:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Intenta escribir directamente en los campos de precio</li>
                <li>• Verifica que puedas usar el teclado para escribir números</li>
                <li>• Prueba usar las flechitas (deberían funcionar también)</li>
                <li>• Verifica que los valores se actualicen en tiempo real</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Prueba de Subida de Imágenes */}
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Subida de Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="test-image-upload"
              />
              <label htmlFor="test-image-upload">
                <Button type="button" variant="outline" className="cursor-pointer">
                  Seleccionar imágenes
                </Button>
              </label>
            </div>

            {uploadedImages.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">No se han seleccionado imágenes aún</p>
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">
                    Imágenes seleccionadas ({uploadedImages.length})
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadedImages([])}
                    className="text-red-600 hover:text-red-700"
                  >
                    Eliminar todas
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
                                              <Image
                          src={image}
                          alt={`Imagen ${index + 1}`}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover"
                        />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Instrucciones de Prueba:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Haz clic en &quot;Seleccionar imágenes&quot;</li>
                <li>• Selecciona una o varias imágenes de tu computadora</li>
                <li>• Verifica que las imágenes se muestren correctamente</li>
                <li>• Prueba eliminar imágenes individuales o todas</li>
                <li>• Verifica que no haya errores en la consola del navegador</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Información del Navegador */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Navegador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User Agent:</strong>
                <p className="text-muted-foreground break-all">{navigator.userAgent}</p>
              </div>
              <div>
                <strong>Plataforma:</strong>
                <p className="text-muted-foreground">{navigator.platform}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

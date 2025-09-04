import React from 'react';
import Image from 'next/image';
import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: string[];
  onRemoveImage: (index: number) => void;
  onRemoveAll: () => void;
  title?: string;
  showTips?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemoveImage,
  onRemoveAll,
  title = "Imágenes del consultorio",
  showTips = true
}) => {
  if (images.length === 0) {
    return showTips ? (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Consejos para mejores fotos:</p>
            <ul className="space-y-1 text-xs">
              <li>• Toma fotos con buena iluminación</li>
              <li>• Muestra diferentes ángulos del consultorio</li>
              <li>• Incluye fotos del equipamiento médico</li>
              <li>• Destaca las comodidades disponibles</li>
            </ul>
          </div>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-foreground">
          {title} ({images.length})
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemoveAll}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4 mr-1" />
          Eliminar todas
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group border border-border rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={`Imagen ${index + 1} del consultorio`}
              width={200}
              height={150}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
            
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded font-medium">
                <CheckCircle className="h-3 w-3 mr-1 inline" />
                Principal
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">¡Perfecto! Imágenes listas</p>
            <p>La primera imagen será la principal y se mostrará en los resultados de búsqueda.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

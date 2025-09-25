
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type Model = 
  | 'retangular' 
  | 'quadrado' 
  | 'redondo' 
  | 'oval-puro' 
  | 'oval-reto'
  | 'oval-duas-pontas'
  | 'organico-1'
  | 'organico-2'
  | undefined;

interface MirrorModelPreviewProps extends SVGProps<SVGSVGElement> {
  model: Model;
}

// Um componente placeholder simples para quando nenhum modelo é selecionado
const Placeholder = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeDasharray="4 4"
    {...props}
  >
    <rect x="2" y="2" width="96" height="96" rx="10" />
    <text x="50" y="55" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">
      Selecione um modelo
    </text>
  </svg>
);


const models: Record<NonNullable<Model>, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  retangular: (props) => <rect x="10" y="20" width="80" height="60" rx="4" {...props} />,
  quadrado: (props) => <rect x="15" y="15" width="70" height="70" rx="4" {...props} />,
  redondo: (props) => <circle cx="50" cy="50" r="40" {...props} />,
  'oval-puro': (props) => <ellipse cx="50" cy="50" rx="45" ry="30" {...props} />,
  'oval-reto': (props) => (
    <path d="M 20 20 H 80 A 40 40 0 0 1 80 80 H 20 A 40 40 0 0 1 20 20 Z" {...props} />
  ),
  'oval-duas-pontas': (props) => (
    <path d="M 20 35 V 65 A 15 15 0 0 0 35 80 H 65 A 15 15 0 0 0 80 65 V 35 A 15 15 0 0 0 65 20 H 35 A 15 15 0 0 0 20 35 Z" {...props} />
  ),
  'organico-1': (props) => (
    <path d="M 85.4,75.9 C 93.5,60.8 94.1,40.1 82.1,25.3 70.1,10.5 49.5,4.8 33.2,12.3 16.9,19.8 6.5,38.9 11.4,56.4 16.3,73.9 33.9,86.4 51.5,86.6 69.1,86.8 77.3,91 85.4,75.9 Z" {...props} />
  ),
  'organico-2': (props) => (
    <path d="M 82.5,23.3 C 71.3,10.4 51.4,12.2 38.8,22.2 26.2,32.2 23.4,49.8 28.8,64.3 34.2,78.8 47,88.4 61.6,88.7 76.2,89 89.2,78.2 91.5,63.5 93.8,48.8 93.7,36.2 82.5,23.3 Z" {...props} />
  ),
};

export function MirrorModelPreview({ model, className, ...props }: MirrorModelPreviewProps) {
  const ModelComponent = model ? models[model] : Placeholder;
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      className={cn(className)}
      {...props}
    >
      <ModelComponent />
    </svg>
  );
}

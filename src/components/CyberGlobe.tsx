'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GlobeTrotter = dynamic(() => import('react-globe.gl'), { ssr: false });
interface CyberGlobeProps {
    widgetSize?: number;
}
export default function CyberGlobe({ widgetSize }: CyberGlobeProps) {
    const globeRef = useRef<any>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [countries, setCountries] = useState({ features: [] });

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then((res) => res.json())
            .then((data) => setCountries(data))
            .catch((err) => console.error("Error cargando el GeoJSON optimizado:", err));

        const updateDimensions = () => {
            // logica del tamaño
            if (widgetSize) {
                setDimensions({ width: widgetSize, height: widgetSize });
            } else {
                const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 800);
                setDimensions({ width: size, height: size });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        if (globeRef.current) {
            globeRef.current.controls().autoRotate = true;
            globeRef.current.controls().autoRotateSpeed = 0.5;
            globeRef.current.controls().enableZoom = true;
        }

        return () => window.removeEventListener('resize', updateDimensions);
    }, [widgetSize]);

    return (
        <div className="flex items-center justify-center relative group">
            <div className="absolute inset-0 rounded-full bg-emerald-900/10 blur-[100px] transition-all group-hover:bg-emerald-900/20" />

            <GlobeTrotter
                ref={globeRef}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                showAtmosphere={true}
                atmosphereColor="#10b981"
                atmosphereAltitude={0.15}
                // datos de vectores
                hexPolygonsData={countries.features}
                hexPolygonResolution={2} // tamaño de hexagonos
                hexPolygonMargin={0.2} // espacio entre hexagonos
                hexPolygonColor={() => 'rgba(16, 185, 129, 0.6)'} // Esmeralda semi-transparente
                // Arcos (se usarán después)
                arcColor={() => '#10b981'}
                arcDashLength={0.9}
                arcDashGap={4}
                arcDashAnimateTime={1000}
            />
        </div>
    );
}
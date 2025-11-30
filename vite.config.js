import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                equipo: resolve(__dirname, 'equipo.html'),
                manifesto: resolve(__dirname, 'manifesto.html'),
                contacto: resolve(__dirname, 'contacto.html'),
                'casos-de-exito': resolve(__dirname, 'casos-de-exito.html'),
                'caso-bobo': resolve(__dirname, 'caso-bobo.html'),
                'nuestra-historia': resolve(__dirname, 'nuestra-historia.html'),
                'publicidad-en-medios': resolve(__dirname, 'publicidad-en-medios.html'),
                'automatizacion-de-procesos': resolve(__dirname, 'automatizacion-de-procesos.html'),
                'diseno-de-marca': resolve(__dirname, 'diseno-de-marca.html'),
                'email-marketing': resolve(__dirname, 'email-marketing.html'),
                'gestion-de-redes': resolve(__dirname, 'gestion-de-redes.html'),
                'influencer-marketing': resolve(__dirname, 'influencer-marketing.html'),
            },
        },
    },
});

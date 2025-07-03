# Visualizador web

![demo](https://github.com/FlowReserve/visualizador-web/assets/95890928/32fc3552-8be2-410b-af28-3091fd367b01)

Este proyecto integra todas las funcionalidades previas del visualizador de pacientes a un entorno web. Entre estas funcionalidades se incluyen:

- Vista 3D interactiva de pacientes.
- Alternar mapa de colores del modelo en 3D según los valores de Fractional Flow Reserve (FFR) o Wall Shear Stress (WSS) con relación a la zona de riesgo y/o lesión.
- Calcular el porcentaje de estenosis de un punto a otro.
- Gráficos de líneas para niveles de FFR entre dos puntos.


## Instalación y uso (desarrollo)

Para descargar este proyecto, abrimos una terminal en el directorio donde deseemos guardarlo y ejecutamos el siguiente comando:

### `git clone https://github.com/FlowReserve/visualizador-web.git`

Esto accederá a este repositorio y extraerá sus datos a nuestro equipo.

Para la ejecución de este proyecto en nuestro equipo, ubicados en el directorio donde guardamos los datos del repositorio, ejecutamos el siguiente comando en una terminal:

### `npm start`

En caso de que no se abra nuestro navegador directamente, abrimos [http://localhost:3000](http://localhost:3000).


## Instalación y uso (producción)

Para descargar este proyecto, abrimos una terminal en el directorio donde deseemos guardarlo y ejecutamos el siguiente comando:

### `git clone https://github.com/FlowReserve/visualizador-web.git`

Esto accederá a este repositorio y extraerá sus datos a nuestro equipo.

Para ejecutar este proyecto en nuestro equipo, antes debemos instalar [WSL](https://learn.microsoft.com/es-es/windows/wsl/install) y [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Si ya contamos con Docker y WSL en nuestro equipo, hacemos lo siguiente:

1. Abrimos Docker Desktop
2. Iniciamos una nueva ventana en nuestra terminal
3. Ubicamos esta ventana en el directorio donde se encuentran los archivos del repositorio que descargamos anteriormente
4. Ejecutamos estos dos comandos en orden:

   ### `docker build -t react-app`
   ### `docker run -p 5000:80 react-app`

5. Abrimos nuestro navegador en localhost:5000

6. Para montar correctamente la aplicación para producción es necesario crear un build de la aplicación. Para ello se deberá ejecutar previamente el siguiente comando:

```bash
npm run build
```

<p align="center">
  <img src="[https://tu-servidor.com/ruta-al-logo.png](https://www.google.com/url?sa=i&url=https%3A%2F%2Fnegnatural.com%2F&psig=AOvVaw1aZiPcMrnGX4lrszW16BYC&ust=1744395062801000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCIiWn5KIzowDFQAAAAAdAAAAABBH
)" alt="Logo NEG" width="200"/>
</p>

# App Coberturas

Aplicación web interna para la gestión y visualización de coberturas financieras, desarrollada como una solución **fullstack** con **Angular** y **.NET Core**. Esta herramienta está diseñada para permitir a usuarios internos consultar, editar y registrar operaciones relacionadas con instrumentos financieros, integrando precios de mercado en tiempo real desde fuentes externas como Bloomberg y Platts.

## 🧩 Tecnologías principales

- **Frontend:** Angular (v15+)
  - Angular Material
  - PrimeNG
  - NGX Spinner
- **Backend:** ASP.NET Core Web API (.NET 6+)
- **Base de datos:** SQL Server
- **Autenticación:** JWT
- **Permisos por usuario:** Control dinámico de UI y rutas
- **Integraciones externas:** 
  - API de Bloomberg
  - API de Platts (S&P Global)

## 🚀 Ejecución del proyecto en entorno de desarrollo

### Backend (.NET Core)

```bash
cd Coberturas.API
dotnet run
```

> Asegúrate de configurar correctamente la cadena de conexión en `appsettings.json`, así como la clave JWT y las credenciales para acceder a las APIs externas.

### Frontend (Angular)

```bash
cd CoberturasApp
npm install
ng serve
```

La aplicación Angular se servirá en: [http://localhost:4200](http://localhost:4200)

> En producción, se recomienda compilar con `ng build --prod` y desplegar en IIS u otro servidor web.

## 📦 Comandos útiles para desarrollo (Angular CLI)

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli).

### Servidor de desarrollo

```bash
ng serve
```

Navega a `http://localhost:4200/`. La aplicación se recarga automáticamente al guardar cambios.

### Generar nuevos componentes

```bash
ng generate component component-name
```

También puedes usar:

```bash
ng generate directive|pipe|service|class|guard|interface|enum|module
```

### Compilar el proyecto

```bash
ng build
```

Los archivos compilados se almacenarán en la carpeta `dist/`.

### Pruebas unitarias

```bash
ng test
```

Ejecuta las pruebas unitarias usando [Karma](https://karma-runner.github.io).

### Pruebas end-to-end

```bash
ng e2e
```

Para pruebas end-to-end, debes instalar un framework compatible (como Cypress o Protractor).

### Ayuda adicional

```bash
ng help
```

O visita la [documentación oficial de Angular CLI](https://angular.io/cli).

## 📂 Estructura del proyecto

```
AppCoberturas/
├── Coberturas.API/            # Backend en ASP.NET Core
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   └── appsettings.json
├── CoberturasApp/             # Frontend en Angular
│   ├── src/app/
│   │   ├── auth/              # Autenticación y login
│   │   ├── trades/            # Módulo de operaciones y coberturas
│   │   ├── shared/            # Servicios, pipes, componentes comunes
│   │   └── ...
│   └── angular.json
```

## 🔐 Seguridad y control de accesos

- **Autenticación JWT:** El backend genera tokens al iniciar sesión.
- **Permisos dinámicos:** El frontend carga permisos por usuario desde la base de datos y controla:
  - Acceso a rutas (`RouterGuard`)
  - Visibilidad de botones y opciones del menú
  - Habilitación de acciones sensibles (crear, editar, eliminar)

## 🧠 Funcionalidades principales

- Gestión de operaciones de cobertura (trades)
- Consulta por rango de fechas y tipo de instrumento
- Asignación automática de precios de mercado desde Bloomberg o Platts
- Edición de trades con validaciones
- Exportación de resultados a CSV
- Interfaz moderna y responsiva
- Manejo de índices y símbolos por parte del administrador

## 🛠 Requisitos del entorno

- Node.js (v16 o superior)
- Angular CLI (`npm install -g @angular/cli`)
- .NET 6 SDK
- SQL Server en ejecución (con las tablas y stored procedures configuradas)
- Visual Studio Code o Visual Studio (opcional pero recomendado)

## ✅ Buenas prácticas implementadas

- Código modular y reutilizable
- Separación de responsabilidades (servicios, componentes, DTOs)
- Consumo de APIs externas desacoplado mediante servicios inyectables
- Manejo de errores con `toastr` y `spinner` para UX fluida
- Persistencia del rango de fechas en `localStorage` para facilitar navegación

## ✨ Créditos

Proyecto desarrollado por el equipo de **Planeación** como parte del sistema interno de gestión de coberturas, en colaboración con el equipo de **TI**.

## 📌 Notas adicionales

- Las credenciales de Bloomberg se pueden consultar  actualizar anualmente desde el portal de Data<Go> de Bloomberg.
- Las rutas sensibles están protegidas mediante autenticación y permisos.

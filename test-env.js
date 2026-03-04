// Test para verificar la variable de entorno en producción
console.log('=================================');
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000');
console.log('=================================');

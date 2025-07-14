import React from 'react';

const backgroundUrl = "https://blog.institutopulevanutricion.es/wp-content/uploads/sites/2/2023/11/20231113.jpg";

export default function Home() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        minHeight: '100vh',
        width: '100vw',
        height: '100vh',
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0,
        zIndex: -1, // Permite que otros elementos (como navbar) se muestren encima
      }}
    />
  );
}

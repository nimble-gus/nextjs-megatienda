'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthAndLoadUser();
    }, []);

    const checkAuthAndLoadUser = async () => {
        try {
            const response = await fetch('/api/auth/status', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.isAuthenticated) {
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        const userData = JSON.parse(savedUser);
                        setUser(userData);
                    } else {
                        router.push('/');
                    }
                } else {
                    router.push('/');
                }
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Error checking auth:', error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh',
                background: '#f7fafc'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTop: '4px solid #ff6a00',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                }}></div>
                <p style={{ color: '#718096', fontSize: '16px', margin: 0 }}>Cargando perfil...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
            <Header />
            
            <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden'
                }}>
                    {/* Header del perfil */}
                    <div style={{
                        background: 'linear-gradient(135deg, #ff6a00 0%, #ff8f00 100%)',
                        color: 'white',
                        padding: '40px',
                        textAlign: 'center'
                    }}>
                        <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: '700' }}>Mi Perfil</h1>
                        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>Gestiona tu información personal</p>
                    </div>

                    {/* Contenido del perfil */}
                    <div style={{ padding: '40px' }}>
                        {/* Sección del avatar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '40px',
                            paddingBottom: '30px',
                            borderBottom: '2px solid #f7fafc'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ff6a00 0%, #ff8f00 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                                }}>
                                    {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#2d3748' }}>
                                    {user?.nombre || 'Usuario'}
                                </h2>
                            </div>
                        </div>

                        {/* Información del usuario */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    fontSize: '14px'
                                }}>Nombre completo</label>
                                <p style={{
                                    margin: 0,
                                    padding: '12px 16px',
                                    background: '#f7fafc',
                                    borderRadius: '10px',
                                    color: '#2d3748',
                                    fontSize: '16px',
                                    border: '2px solid transparent'
                                }}>{user?.nombre || 'No especificado'}</p>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    fontSize: '14px'
                                }}>Correo electrónico</label>
                                <p style={{
                                    margin: 0,
                                    padding: '12px 16px',
                                    background: '#f7fafc',
                                    borderRadius: '10px',
                                    color: '#2d3748',
                                    fontSize: '16px',
                                    border: '2px solid transparent'
                                }}>{user?.email || 'No especificado'}</p>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    fontSize: '14px'
                                }}>Teléfono</label>
                                <p style={{
                                    margin: 0,
                                    padding: '12px 16px',
                                    background: '#f7fafc',
                                    borderRadius: '10px',
                                    color: '#2d3748',
                                    fontSize: '16px',
                                    border: '2px solid transparent'
                                }}>{user?.telefono || 'No especificado'}</p>
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    fontSize: '14px'
                                }}>Dirección</label>
                                <p style={{
                                    margin: 0,
                                    padding: '12px 16px',
                                    background: '#f7fafc',
                                    borderRadius: '10px',
                                    color: '#2d3748',
                                    fontSize: '16px',
                                    border: '2px solid transparent'
                                }}>{user?.direccion || 'No especificado'}</p>
                            </div>
                        </div>

                        {/* Enlaces del perfil */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            <Link href="/orders" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '20px',
                                background: '#f7fafc',
                                borderRadius: '15px',
                                textDecoration: 'none',
                                color: '#2d3748',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '2px solid transparent'
                            }} onMouseEnter={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.borderColor = '#ff6a00';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                            }} onMouseLeave={(e) => {
                                e.target.style.background = '#f7fafc';
                                e.target.style.borderColor = 'transparent';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: '#ff6a00' }}>
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                                </svg>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>Ver mis pedidos</span>
                            </Link>
                            
                            <Link href="/cart" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '20px',
                                background: '#f7fafc',
                                borderRadius: '15px',
                                textDecoration: 'none',
                                color: '#2d3748',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '2px solid transparent'
                            }} onMouseEnter={(e) => {
                                e.target.style.background = 'white';
                                e.target.style.borderColor = '#ff6a00';
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                            }} onMouseLeave={(e) => {
                                e.target.style.background = '#f7fafc';
                                e.target.style.borderColor = 'transparent';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: '#ff6a00' }}>
                                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                                <span style={{ fontWeight: '600', fontSize: '16px' }}>Ver mi carrito</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProfilePage;


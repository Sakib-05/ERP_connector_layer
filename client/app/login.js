'use client'

import { useRouter } from 'next/navigation'


export default function login() {

    return (
        <div>
            <h1 style={{fontFamily: "Arial, sans-serif",}}>Login Page</h1>
            <label htmlFor="username">Username:</label>
            <input type="text" />
            <label htmlFor="password">Password:</label>
            <input type="password" />
            <button type="button" onClick={() => router.push('/myTenants')}>Login</button>
        </div>
    );

    
};

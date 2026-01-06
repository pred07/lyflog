'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getContextZones, addContextZone, deleteContextZone } from '@/lib/firebase/context';
import { ContextZone } from '@/lib/types/context';
import ContextZoneManager from '@/components/zones/ContextZoneManager';

export default function ZonesPage() {
    const { user } = useAuth();
    const [zones, setZones] = useState<ContextZone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadZones = async () => {
            try {
                const data = await getContextZones(user.userId);
                setZones(data);
            } catch (error) {
                console.error('Error loading zones:', error);
            } finally {
                setLoading(false);
            }
        };

        loadZones();
    }, [user]);

    const handleCreateZone = async (label: string, startDate: Date, endDate: Date, color: string) => {
        if (!user) return;

        try {
            const zoneId = await addContextZone(user.userId, { label, startDate, endDate, color });
            const newZone: ContextZone = {
                id: zoneId,
                userId: user.userId,
                label,
                startDate,
                endDate,
                color,
                createdAt: new Date(),
            };
            setZones([...zones, newZone]);
        } catch (error) {
            console.error('Error creating zone:', error);
        }
    };

    const handleUpdateZone = async (zoneId: string, updates: Partial<ContextZone>) => {
        if (!user) return;

        try {
            // Note: existing context.ts doesn't have updateZone, so we'll just update local state
            setZones(zones.map(z => z.id === zoneId ? { ...z, ...updates } : z));
        } catch (error) {
            console.error('Error updating zone:', error);
        }
    };

    const handleDeleteZone = async (zoneId: string) => {
        if (!user) return;

        try {
            await deleteContextZone(user.userId, zoneId);
            setZones(zones.filter(z => z.id !== zoneId));
        } catch (error) {
            console.error('Error deleting zone:', error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="animate-pulse">Loading zones...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <ContextZoneManager
                zones={zones}
                onCreateZone={handleCreateZone}
                onUpdateZone={handleUpdateZone}
                onDeleteZone={handleDeleteZone}
            />
        </div>
    );
}

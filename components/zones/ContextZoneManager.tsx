'use client';

import { useState } from 'react';
import { ContextZone } from '@/lib/types/context';
import { format } from 'date-fns';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

interface ContextZoneManagerProps {
    zones: ContextZone[];
    onCreateZone: (label: string, startDate: Date, endDate: Date, color: string) => Promise<void>;
    onUpdateZone: (zoneId: string, updates: Partial<ContextZone>) => Promise<void>;
    onDeleteZone: (zoneId: string) => Promise<void>;
}

export default function ContextZoneManager({ zones, onCreateZone, onUpdateZone, onDeleteZone }: ContextZoneManagerProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Context Zones</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Define special periods to optionally exclude from analysis
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={16} />
                    Create Zone
                </button>
            </div>

            {/* Zone List */}
            <div className="space-y-3">
                {zones.length === 0 ? (
                    <div className="card p-8 text-center text-gray-500">
                        <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No zones defined yet.</p>
                        <p className="text-sm mt-2">Create a zone to mark special periods like vacation or illness.</p>
                    </div>
                ) : (
                    zones.map(zone => (
                        <ZoneCard
                            key={zone.id}
                            zone={zone}
                            isEditing={editingId === zone.id}
                            onEdit={() => setEditingId(zone.id)}
                            onCancelEdit={() => setEditingId(null)}
                            onUpdate={(updates) => {
                                onUpdateZone(zone.id, updates);
                                setEditingId(null);
                            }}
                            onDelete={() => onDeleteZone(zone.id)}
                        />
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isCreating && (
                <ZoneModal
                    onSave={(name, startDate, endDate, color) => {
                        onCreateZone(name, startDate, endDate, color);
                        setIsCreating(false);
                    }}
                    onCancel={() => setIsCreating(false)}
                />
            )}
        </div>
    );
}

// Zone Card Component
interface ZoneCardProps {
    zone: ContextZone;
    isEditing: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onUpdate: (updates: Partial<ContextZone>) => void;
    onDelete: () => void;
}

function ZoneCard({ zone, isEditing, onEdit, onCancelEdit, onUpdate, onDelete }: ZoneCardProps) {
    const [label, setLabel] = useState(zone.label);
    const [startDate, setStartDate] = useState(format(zone.startDate, 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(zone.endDate, 'yyyy-MM-dd'));
    const [color, setColor] = useState(zone.color);

    const handleSave = () => {
        onUpdate({
            label,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            color,
        });
    };

    if (isEditing) {
        return (
            <div className="card p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className="input-field"
                        placeholder="Zone name"
                    />
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-10 w-20"
                    />
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="input-field"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary text-sm">
                        Save
                    </button>
                    <button onClick={onCancelEdit} className="btn-secondary text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: zone.color }}
                />
                <div>
                    <h3 className="font-semibold">{zone.label}</h3>
                    <p className="text-sm text-gray-500">
                        {format(zone.startDate, 'MMM d, yyyy')} → {format(zone.endDate, 'MMM d, yyyy')}
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onEdit}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={onDelete}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

// Zone Modal Component
interface ZoneModalProps {
    onSave: (name: string, startDate: Date, endDate: Date, color: string) => void;
    onCancel: () => void;
}

function ZoneModal({ onSave, onCancel }: ZoneModalProps) {
    const [label, setLabel] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [color, setColor] = useState('#3b82f6');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (label && startDate && endDate) {
            onSave(label, new Date(startDate), new Date(endDate), color);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4 p-6">
                <h3 className="text-xl font-bold mb-4">Create Context Zone</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Zone Name</label>
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="input-field"
                            placeholder="e.g., Vacation, Illness, Training"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-full"
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="btn-primary flex-1">
                            Create Zone
                        </button>
                        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

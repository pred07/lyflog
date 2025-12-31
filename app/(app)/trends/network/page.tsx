'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { getUserLogs } from '@/lib/firebase/firestore';
import { DailyLog } from '@/lib/types/log';
import { calculateCorrelation, getMetricValue, CorrelationResult } from '@/lib/analysis/stats';
import { HelpCircle, Network } from 'lucide-react';
import Link from 'next/link';

// Simple types for the graph
interface Node {
    id: string;
    label: string;
    description?: string;
    type: 'core' | 'custom' | 'exposure';
    x: number;
    y: number;
    vx: number;
    vy: number;
}

interface Edge {
    source: string;
    target: string;
    value: number; // correlation coefficient
    strength: number; // absolute value for visual width
}

export default function NetworkPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<DailyLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    // Canvas/Graph Refs
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const loadLogs = async () => {
            if (!user) return;
            try {
                const userLogs = await getUserLogs(user.userId);
                setLogs(userLogs);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            loadLogs();
        }
    }, [user]);

    // 1. Prepare Data: Nodes and Edges
    const graphData = useMemo(() => {
        if (!user || logs.length < 20) return { nodes: [], edges: [] };

        const nodes: Node[] = [];

        // Add Core Metrics
        ['sleep', 'workout', 'meditation', 'learning'].forEach((id, i) => {
            nodes.push({
                id,
                label: id.charAt(0).toUpperCase() + id.slice(1),
                type: 'core',
                x: 0, y: 0, vx: 0, vy: 0
            });
        });

        // Add Custom Metrics
        user.metrics?.forEach(m => {
            nodes.push({
                id: m.id,
                label: m.label,
                type: 'custom',
                x: 0, y: 0, vx: 0, vy: 0
            });
        });

        // Add Exposures
        user.exposures?.forEach(e => {
            nodes.push({
                id: e.id,
                label: e.label,
                type: 'exposure',
                x: 0, y: 0, vx: 0, vy: 0
            });
        });

        // Calculate Edges (Correlations)
        const edges: Edge[] = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const n1 = nodes[i];
                const n2 = nodes[j];

                // Calculate correlation
                const r = calculateCorrelation(logs, n1.id, n2.id);
                // Threshold: only show relevant correlations > 0.3
                if (r && Math.abs(r) > 0.3) {
                    edges.push({
                        source: n1.id,
                        target: n2.id,
                        value: r,
                        strength: Math.abs(r)
                    });
                }
            }
        }

        // Initial Layout: Randomize positions slightly centered
        const cx = dimensions.width / 2;
        const cy = dimensions.height / 2;
        nodes.forEach(n => {
            n.x = cx + (Math.random() - 0.5) * 200;
            n.y = cy + (Math.random() - 0.5) * 200;
        });

        return { nodes, edges };
    }, [user, logs, dimensions]);

    // 2. Simulation Step (Simple Force Directed)
    const [simulationNodes, setSimulationNodes] = useState<Node[]>([]);

    useEffect(() => {
        if (graphData.nodes.length === 0) return;

        // Clone nodes to avoid mutating memoized data if we were strict, but here we just set state
        let currentNodes = JSON.parse(JSON.stringify(graphData.nodes));

        const tick = () => {
            const width = dimensions.width;
            const height = dimensions.height;
            const k = 0.1; // repulsion constant
            const c = 0.05; // spring constant
            const damping = 0.9;
            const centerForce = 0.01;

            // Forces
            for (let i = 0; i < currentNodes.length; i++) {
                const n1 = currentNodes[i];

                // 1. Repulsion (between all nodes)
                for (let j = 0; j < currentNodes.length; j++) {
                    if (i === j) continue;
                    const n2 = currentNodes[j];
                    const dx = n1.x - n2.x;
                    const dy = n1.y - n2.y;
                    const distSq = dx * dx + dy * dy || 1;
                    const force = k * 5000 / distSq;
                    const angle = Math.atan2(dy, dx);
                    n1.vx += Math.cos(angle) * force;
                    n1.vy += Math.sin(angle) * force;
                }

                // 2. Attraction (Edges)
                graphData.edges.forEach(edge => {
                    if (edge.source === n1.id || edge.target === n1.id) {
                        const otherId = edge.source === n1.id ? edge.target : edge.source;
                        const n2 = currentNodes.find((n: Node) => n.id === otherId);
                        if (n2) {
                            const dx = n1.x - n2.x;
                            const dy = n1.y - n2.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            // Desired distance based on correlation? Stronger = closer?
                            // Let's just say standard spring desire 200px
                            const force = (dist - 150) * c;
                            const angle = Math.atan2(dy, dx);
                            n1.vx -= Math.cos(angle) * force;
                            n1.vy -= Math.sin(angle) * force;
                        }
                    }
                });

                // 3. Center Gravity
                n1.vx += (width / 2 - n1.x) * centerForce;
                n1.vy += (height / 2 - n1.y) * centerForce;

                // Apply velocity
                n1.vx *= damping;
                n1.vy *= damping;
                n1.x += n1.vx;
                n1.y += n1.vy;

                // Bounds
                n1.x = Math.max(50, Math.min(width - 50, n1.x));
                n1.y = Math.max(50, Math.min(height - 50, n1.y));
            }

            setSimulationNodes([...currentNodes]);
        };

        // Run simulation for 300 ticks then stop to save CPU
        let ticks = 0;
        const interval = setInterval(() => {
            tick();
            ticks++;
            if (ticks > 300) clearInterval(interval);
        }, 16);

        return () => clearInterval(interval);
    }, [graphData]);


    const getNodeColor = (type: string) => {
        switch (type) {
            case 'core': return 'var(--chart-primary)'; // user preferred blue/purple
            case 'custom': return '#10b981'; // emerald
            case 'exposure': return '#f59e0b'; // amber
            default: return 'gray';
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading network...</div>;

    if (simulationNodes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl my-8">
                    <p className="text-gray-500">Not enough data to generate a network map (Need 20+ days).</p>
                    <Link href="/log" className="text-indigo-500 hover:underline mt-2 inline-block">Log more days</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Link href="/trends" className="hover:text-gray-900 dark:hover:text-gray-100">Trends</Link>
                        <span>/</span>
                        <span>Network</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Network /> Metric Map
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Visualizing the hidden web of connections between your habits and states.
                    </p>
                </div>
            </header>

            <div className="relative border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden h-[600px]">
                <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
                    {/* Edges */}
                    {graphData.edges.map((edge, i) => {
                        const sourceParams = simulationNodes.find(n => n.id === edge.source);
                        const targetParams = simulationNodes.find(n => n.id === edge.target);
                        if (!sourceParams || !targetParams) return null;

                        const isDimmed = selectedNode && selectedNode.id !== edge.source && selectedNode.id !== edge.target;
                        const opacity = isDimmed ? 0.1 : 0.6;

                        return (
                            <line
                                key={i}
                                x1={sourceParams.x}
                                y1={sourceParams.y}
                                x2={targetParams.x}
                                y2={targetParams.y}
                                stroke={edge.value > 0 ? '#10b981' : '#ef4444'} // Green pos, Red neg
                                strokeWidth={edge.strength * 5}
                                strokeOpacity={opacity}
                            />
                        );
                    })}

                    {/* Nodes */}
                    {simulationNodes.map((node) => {
                        const isDimmed = selectedNode
                            && selectedNode.id !== node.id
                            && !graphData.edges.find(e => (e.source === node.id && e.target === selectedNode.id) || (e.target === node.id && e.source === selectedNode.id));

                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x},${node.y})`}
                                onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                                className="cursor-pointer transition-opacity duration-300"
                                style={{ opacity: isDimmed ? 0.2 : 1 }}
                            >
                                <circle
                                    r={node.type === 'core' ? 30 : 20}
                                    fill={getNodeColor(node.type)}
                                    className="shadow-md"
                                />
                                <text
                                    dy={node.type === 'core' ? 5 : 4}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize={node.type === 'core' ? 12 : 10}
                                    fontWeight="500"
                                    pointerEvents="none"
                                >
                                    {node.label.slice(0, 3)}
                                </text>
                                <title>{node.label}</title>
                            </g>
                        );
                    })}
                </svg>

                {/* Overlay details for selected node */}
                {selectedNode && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg animate-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold" style={{ color: getNodeColor(selectedNode.type) }}>{selectedNode.label}</h3>
                                <p className="text-sm text-gray-500 mb-2">Connected Metrics</p>
                                <div className="flex flex-wrap gap-2">
                                    {graphData.edges
                                        .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                                        .map((e, i) => {
                                            const otherId = e.source === selectedNode.id ? e.target : e.source;
                                            const otherNode = simulationNodes.find(n => n.id === otherId);
                                            return (
                                                <div key={i} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs flex items-center gap-2">
                                                    <span>{otherNode?.label}</span>
                                                    <span className={`font-mono font-bold ${e.value > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                        {e.value > 0 ? '+' : ''}{e.value.toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                    {graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                                        <span className="text-sm text-gray-400 italic">No significant correlations found yet.</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-gray-900">×</button>
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-lg border border-gray-100 dark:border-gray-800 text-xs space-y-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--chart-primary)]"></div> Core</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> User Metric</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Exposure</div>
                </div>
            </div>
        </div>
    );
}

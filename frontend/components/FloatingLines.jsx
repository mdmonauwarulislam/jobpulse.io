import React, { useEffect, useRef } from 'react';

const FloatingLines = ({
    linesGradient = ["#ff6b35", "#ea580c", "#fb923c"], // Primary 500, 600, 400
    animationSpeed = 0.002,
    interactive = true,
    bendRadius = 400,
    bendStrength = 0.2
}) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const linesRef = useRef([]);
    const frameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        // Fluid Plasma Config
        const numLines = 5;
        linesRef.current = [];

        // Create broad, sweeping waves
        for (let i = 0; i < numLines; i++) {
            linesRef.current.push({
                y: height / 2, // Centered
                amplitude: height * 0.25 + Math.random() * (height * 0.2), // Huge waves
                frequency: 0.001 + Math.random() * 0.002, // Very long wavelength
                phase: Math.random() * Math.PI * 2,
                speed: animationSpeed * 0.5 + Math.random() * 0.001, // Slow drift
                color: linesGradient[i % linesGradient.length],
                width: 50 + Math.random() * 50 // Variable thickness
            });
        }

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
            linesRef.current.forEach(line => line.y = height / 2);
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('resize', handleResize);
        if (interactive) {
            canvas.addEventListener('mousemove', handleMouseMove);
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Use screen blending for light-on-dark plasma feel
            ctx.globalCompositeOperation = 'screen';

            linesRef.current.forEach(line => {
                ctx.beginPath();
                line.phase += line.speed;

                ctx.strokeStyle = line.color;
                ctx.lineWidth = line.width;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Internal glow
                ctx.shadowBlur = 30;
                ctx.shadowColor = line.color;

                // Smooth curve drawing
                // Draw across width with low resolution for performance but 'curvy' look
                // Using a single bezier curve would be too simple, using many small lines is too jagged
                // We use a sine approximation

                // Start point
                let startY = line.y + Math.sin(0 * line.frequency + line.phase) * line.amplitude;
                ctx.moveTo(0, startY);

                for (let x = 50; x <= width + 50; x += 50) {
                    // Complex wave: Main sine + slower secondary sine for "liquid" irregularity
                    const y = line.y +
                        Math.sin(x * line.frequency + line.phase) * line.amplitude +
                        Math.cos(x * line.frequency * 0.5 + line.phase * 0.5) * (line.amplitude * 0.5);

                    let finalY = y;

                    // Interactive push
                    if (interactive) {
                        const dx = x - mouseRef.current.x;
                        const dy = y - mouseRef.current.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        // Large gentle influence radius
                        if (dist < bendRadius) {
                            const force = (bendRadius - dist) / bendRadius;
                            // Smooth easing
                            const ease = force * force * (3 - 2 * force);
                            const angle = Math.atan2(dy, dx);
                            finalY += Math.sin(angle) * ease * bendRadius * bendStrength;
                        }
                    }

                    // Smooth bezier to next point
                    // Simple smoothing: control point is half way between x's, at (prevY + newY)/2?
                    // Actually, just calling lineTo with high CSS blur looks like curves.
                    // specialized curve logic:
                    ctx.lineTo(x, finalY);
                }

                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            frameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [linesGradient, animationSpeed, interactive, bendRadius, bendStrength]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{
                touchAction: 'none',
                // Key to the "Fluid/Plasma" look: Heavy CSS blur merges the lines into blobs
                filter: 'blur(60px) contrast(1.5)',
                background: 'transparent'
            }}
        />
    );
};

export default FloatingLines;

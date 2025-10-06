document.addEventListener('DOMContentLoaded', () => {
    const map = document.getElementById('network-map');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const width = window.innerWidth;
    const height = window.innerHeight;
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    map.appendChild(svg);

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    const nodes = [
        { id: 1, name: 'Router', status: 'Online', ip: '192.168.1.1', uptime: '99.9%' },
        { id: 2, name: 'Switch', status: 'Online', ip: '192.168.1.2', uptime: '99.8%' },
        { id: 3, name: 'Server A', status: 'Online', ip: '192.168.1.10', uptime: '98.5%' },
        { id: 4, name: 'Server B', status: 'Warning', ip: '192.168.1.11', uptime: '92.1%' },
        { id: 5, name: 'Workstation 1', status: 'Online', ip: '192.168.1.101', uptime: '99.9%' },
        { id: 6, name: 'Workstation 2', status: 'Offline', ip: '192.168.1.102', uptime: '0%' },
        { id: 7, name: 'Printer', status: 'Online', ip: '192.168.1.200', uptime: '99.7%' },
    ];

    const links = [
        { source: 1, target: 2 },
        { source: 2, target: 3 },
        { source: 2, target: 4 },
        { source: 2, target: 5 },
        { source: 2, target: 6 },
        { source: 1, target: 7 },
    ];

    nodes.forEach(node => {
        node.x = Math.random() * width;
        node.y = Math.random() * height;
        node.vx = 0;
        node.vy = 0;
    });

    const linkElements = links.map(link => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('link');
        svg.appendChild(line);
        return { element: line, ...link };
    });

    const nodeElements = nodes.map(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('node');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', 10);

        if (node.status === 'Offline') {
            circle.style.fill = '#ff4d4d';
            circle.style.stroke = '#ff4d4d';
            circle.style.filter = 'drop-shadow(0 0 5px #ff4d4d) drop-shadow(0 0 10px #ff4d4d)';
        } else if (node.status === 'Warning') {
            circle.style.fill = '#ffd700';
            circle.style.stroke = '#ffd700';
            circle.style.filter = 'drop-shadow(0 0 5px #ffd700) drop-shadow(0 0 10px #ffd700)';
        }

        g.appendChild(circle);
        svg.appendChild(g);

        g.addEventListener('mouseover', (event) => {
            tooltip.style.opacity = '1';
            tooltip.innerHTML = `
                <strong>${node.name}</strong><br>
                Status: ${node.status}<br>
                IP: ${node.ip}<br>
                Uptime: ${node.uptime}
            `;
        });

        g.addEventListener('mousemove', (event) => {
            tooltip.style.left = `${event.pageX + 15}px`;
            tooltip.style.top = `${event.pageY + 15}px`;
        });

        g.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });

        return { element: g, ...node };
    });

    function updatePositions() {
        // Simple physics simulation
        nodes.forEach(node => {
            node.vx *= 0.95; // damping
            node.vy *= 0.95;
            node.x += node.vx;
            node.y += node.vy;

            // Boundary collision
            if (node.x < 10) { node.x = 10; node.vx *= -1; }
            if (node.x > width - 10) { node.x = width - 10; node.vx *= -1; }
            if (node.y < 10) { node.y = 10; node.vy *= -1; }
            if (node.y > height - 10) { node.y = height - 10; node.vy *= -1; }
        });

        // Repulsion force between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) {
                    const force = -0.5 * (150 - distance) / distance;
                    nodes[i].vx += dx * force / 150;
                    nodes[i].vy += dy * force / 150;
                    nodes[j].vx -= dx * force / 150;
                    nodes[j].vy -= dy * force / 150;
                }
            }
        }

        // Attraction force for links
        links.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = 0.001 * distance;
            source.vx += dx * force;
            source.vy += dy * force;
            target.vx -= dx * force;
            target.vy -= dy * force;
        });

        nodeElements.forEach(node => {
            node.element.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        });

        linkElements.forEach(link => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            link.element.setAttribute('x1', sourceNode.x);
            link.element.setAttribute('y1', sourceNode.y);
            link.element.setAttribute('x2', targetNode.x);
            link.element.setAttribute('y2', targetNode.y);
        });

        requestAnimationFrame(updatePositions);
    }

    updatePositions();
});
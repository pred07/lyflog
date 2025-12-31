export default function Footer() {
    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            marginTop: 'auto'
        }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Designed for clarity, not judgment.
                    </p>
                    <div className="flex justify-center space-x-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                        <a href="#" className="hover:underline">Documentation</a>
                        <a href="https://github.com/pred07/lyflog" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

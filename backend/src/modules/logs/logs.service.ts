import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

// Ensure base directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export const logsService = {
    appendLog: async (level: 'INFO' | 'WARN' | 'ERROR', method: string, url: string, message: string, meta?: any) => {
        try {
            const now = new Date();
            const year = now.getFullYear().toString();
            // e.g., 01January
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const month = `${String(now.getMonth() + 1).padStart(2, '0')}${monthNames[now.getMonth()]}`;
            const date = String(now.getDate()).padStart(2, '0');

            const dirPath = path.join(LOGS_DIR, year, month);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }

            const filePath = path.join(dirPath, `${date}.txt`);
            
            const timestamp = now.toISOString();
            const metaStr = meta ? `\nMeta: ${typeof meta === 'object' ? JSON.stringify(meta, null, 2) : meta}` : '';
            const logLine = `[${timestamp}] [${level}] [${method}] [${url}] ${message}${metaStr}\n`;

            // Append to file asynchronously
            fs.appendFile(filePath, logLine, (err) => {
                if (err) console.error("Failed to write log:", err);
            });
        } catch (error) {
            console.error("Failed to append log:", error);
        }
    },

    listLogs: async () => {
        const result: { year: string, month: string, date: string, path: string }[] = [];
        if (!fs.existsSync(LOGS_DIR)) return result;

        const years = fs.readdirSync(LOGS_DIR).filter(y => fs.statSync(path.join(LOGS_DIR, y)).isDirectory());
        
        for (const year of years) {
            const yearPath = path.join(LOGS_DIR, year);
            const months = fs.readdirSync(yearPath).filter(m => fs.statSync(path.join(yearPath, m)).isDirectory());
            
            for (const month of months) {
                const monthPath = path.join(yearPath, month);
                const files = fs.readdirSync(monthPath).filter(f => f.endsWith('.txt'));
                
                for (const file of files) {
                    const date = file.replace('.txt', '');
                    result.push({
                        year,
                        month,
                        date,
                        path: `${year}/${month}/${file}`
                    });
                }
            }
        }
        
        // Sort descending (newest first)
        return result.sort((a, b) => b.path.localeCompare(a.path));
    },

    getLogDetail: async (relativePath: string) => {
        // Prevent directory traversal
        const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(LOGS_DIR, normalizedPath);
        
        if (!fs.existsSync(filePath) || !filePath.startsWith(LOGS_DIR)) {
            throw new Error("Log file not found");
        }
        
        return fs.readFileSync(filePath, 'utf-8');
    },

    deleteLog: async (relativePath: string) => {
        // Prevent directory traversal
        const normalizedPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(LOGS_DIR, normalizedPath);
        
        if (fs.existsSync(filePath) && filePath.startsWith(LOGS_DIR)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }
};

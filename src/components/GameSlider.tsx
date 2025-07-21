import { motion } from 'motion/react';

interface GameCard {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    players: number;
    isActive: boolean;
}

interface GameListProps {
    onGameSelect: (gameId: string) => void;
    selectedGameId?: string | null;
}

const GAMES: GameCard[] = [
    {
        id: 'tic-tac-toe',
        name: 'Tic Tac Toe',
        description: 'Clásico juego de tres en línea',
        icon: '⭕',
        color: '#5865F2',
        players: 2,
        isActive: true
    },
    {
        id: 'connect-four',
        name: 'Conecta 4',
        description: 'Conecta cuatro fichas en línea',
        icon: '🔴',
        color: '#ED4245',
        players: 2,
        isActive: false
    },
    {
        id: 'checkers',
        name: 'Damas',
        description: 'Juego tradicional de damas',
        icon: '⚫',
        color: '#57F287',
        players: 2,
        isActive: false
    },
    {
        id: 'chess',
        name: 'Ajedrez',
        description: 'El juego de los reyes',
        icon: '♔',
        color: '#FEE75C',
        players: 2,
        isActive: false
    },
    {
        id: 'wordle',
        name: 'Wordle',
        description: 'Adivina la palabra en 6 intentos',
        icon: '📝',
        color: '#EB459E',
        players: 1,
        isActive: false
    },
    {
        id: 'snake',
        name: 'Snake',
        description: 'Clásico juego de la serpiente',
        icon: '🐍',
        color: '#57F287',
        players: 1,
        isActive: false
    },
    {
        id: 'tetris',
        name: 'Tetris',
        description: 'Organiza las piezas que caen',
        icon: '🧩',
        color: '#5865F2',
        players: 1,
        isActive: false
    },
    {
        id: 'pong',
        name: 'Pong',
        description: 'El primer videojuego de la historia',
        icon: '🏓',
        color: '#FEE75C',
        players: 2,
        isActive: false
    },
    {
        id: 'memory',
        name: 'Memoria',
        description: 'Encuentra las parejas de cartas',
        icon: '🧠',
        color: '#EB459E',
        players: 1,
        isActive: false
    },
    {
        id: 'sudoku',
        name: 'Sudoku',
        description: 'Completa la cuadrícula numérica',
        icon: '🔢',
        color: '#57F287',
        players: 1,
        isActive: false
    },
    {
        id: 'battleship',
        name: 'Batalla Naval',
        description: 'Hunde la flota enemiga',
        icon: '🚢',
        color: '#5865F2',
        players: 2,
        isActive: false
    },
    {
        id: 'hangman',
        name: 'Ahorcado',
        description: 'Adivina la palabra antes de perder',
        icon: '🪢',
        color: '#ED4245',
        players: 1,
        isActive: false
    },
    {
        id: 'minesweeper',
        name: 'Buscaminas',
        description: 'Encuentra las minas sin explotar',
        icon: '💣',
        color: '#FEE75C',
        players: 1,
        isActive: false
    }
];

export const GameList = ({ onGameSelect, selectedGameId }: GameListProps) => {
    return (
        <div className="game-list-container">
            <div className="game-list-header">
                <h3 className="game-list-title">🎮 Juegos Disponibles</h3>
            </div>

            <div className="game-grid">
                {GAMES.map((game) => (
                    <motion.div
                        key={game.id}
                        className={`game-card ${selectedGameId === game.id ? 'selected' : ''} ${!game.isActive ? 'disabled' : ''}`}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ 
                            scale: game.isActive ? 1.05 : 1,
                            y: game.isActive ? -5 : 0
                        }}
                        whileTap={{ scale: game.isActive ? 0.95 : 1 }}
                        onClick={() => game.isActive && onGameSelect(game.id)}
                        style={{
                            '--game-color': game.color
                        } as any}
                    >
                        <div className="game-card-image">
                            <div className="game-icon" style={{ backgroundColor: game.color }}>
                                {game.icon}
                            </div>
                        </div>
                        
                        <div className="game-card-content">
                            <h4 className="game-name">{game.name}</h4>
                            <p className="game-description">{game.description}</p>
                            
                            <div className="game-card-footer">
                                <div className="game-players">
                                    👥 {game.players} jugador{game.players > 1 ? 'es' : ''}
                                </div>
                                {!game.isActive && (
                                    <div className="game-status">
                                        <span className="coming-soon">Próximamente</span>
                                    </div>
                                )}
                                {game.isActive && (
                                    <motion.div 
                                        className="select-indicator"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: selectedGameId === game.id ? 1 : 0 }}
                                    >
                                        ✓ Seleccionado
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {game.isActive && (
                            <motion.div 
                                className="game-card-glow"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: selectedGameId === game.id ? 0.3 : 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}; 
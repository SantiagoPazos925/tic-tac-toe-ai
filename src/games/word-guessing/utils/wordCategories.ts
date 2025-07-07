import { WordCategory } from '../types';

export const wordCategories: WordCategory[] = [
    {
        id: 'animals',
        name: 'Animales',
        words: [
            'perro', 'gato', 'elefante', 'león', 'tigre', 'oso', 'zebra', 'jirafa',
            'mono', 'pájaro', 'pez', 'tortuga', 'conejo', 'ratón', 'caballo', 'vaca',
            'cerdo', 'oveja', 'pollo', 'pato', 'ganso', 'cisne', 'águila', 'búho',
            'delfín', 'ballena', 'tiburón', 'pulpo', 'cangrejo', 'mariposa', 'abeja',
            'araña', 'hormiga', 'mosquito', 'rana', 'salamandra', 'cocodrilo', 'serpiente'
        ]
    },
    {
        id: 'food',
        name: 'Comida',
        words: [
            'pizza', 'hamburguesa', 'perro caliente', 'ensalada', 'sopa', 'pasta',
            'arroz', 'pollo', 'pescado', 'carne', 'cerdo', 'cordero', 'pavo',
            'huevo', 'leche', 'queso', 'yogur', 'mantequilla', 'pan', 'torta',
            'galleta', 'helado', 'chocolate', 'caramelo', 'manzana', 'plátano',
            'naranja', 'fresa', 'uva', 'piña', 'mango', 'papaya', 'sandía',
            'melón', 'pera', 'durazno', 'cereza', 'limón', 'lima', 'kiwi'
        ]
    },
    {
        id: 'objects',
        name: 'Objetos',
        words: [
            'mesa', 'silla', 'cama', 'sofá', 'televisión', 'computadora', 'teléfono',
            'lámpara', 'espejo', 'reloj', 'libro', 'lápiz', 'papel', 'carpeta',
            'mochila', 'zapatos', 'camisa', 'pantalón', 'vestido', 'sombrero',
            'gafas', 'collar', 'anillo', 'cartera', 'llaves', 'paraguas', 'maleta',
            'cámara', 'radio', 'altavoz', 'micrófono', 'guitarra', 'piano', 'trompeta',
            'tambor', 'violín', 'flauta', 'batería', 'saxofón', 'acordeón'
        ]
    },
    {
        id: 'nature',
        name: 'Naturaleza',
        words: [
            'árbol', 'flor', 'hierba', 'montaña', 'río', 'lago', 'mar', 'océano',
            'playa', 'desierto', 'bosque', 'selva', 'pradera', 'valle', 'colina',
            'volcán', 'cascada', 'cueva', 'isla', 'península', 'bahía', 'golfo',
            'estrecho', 'canal', 'puente', 'túnel', 'carretera', 'camino', 'sendero',
            'roca', 'piedra', 'arena', 'tierra', 'barro', 'nieve', 'hielo', 'lluvia',
            'nube', 'sol', 'luna', 'estrella', 'arcoíris', 'viento', 'tormenta'
        ]
    },
    {
        id: 'transport',
        name: 'Transporte',
        words: [
            'coche', 'camión', 'autobús', 'tren', 'avión', 'barco', 'bicicleta',
            'motocicleta', 'helicóptero', 'yate', 'velero', 'submarino', 'cohete',
            'nave espacial', 'globo', 'paracaídas', 'escalera', 'ascensor', 'escalera mecánica',
            'teleférico', 'tranvía', 'metro', 'taxi', 'ambulancia', 'bombero', 'policía',
            'grúa', 'excavadora', 'bulldozer', 'tractor', 'carretilla', 'patineta',
            'patines', 'snowboard', 'esquí', 'trineo', 'carroza', 'carreta'
        ]
    },
    {
        id: 'professions',
        name: 'Profesiones',
        words: [
            'doctor', 'enfermero', 'profesor', 'estudiante', 'abogado', 'juez',
            'policía', 'bombero', 'soldado', 'marinero', 'piloto', 'conductor',
            'mecánico', 'electricista', 'plomero', 'carpintero', 'pintor', 'albañil',
            'arquitecto', 'ingeniero', 'científico', 'investigador', 'periodista',
            'escritor', 'artista', 'músico', 'actor', 'cantante', 'bailarín',
            'cocinero', 'camarero', 'vendedor', 'contador', 'secretario', 'recepcionista',
            'bibliotecario', 'farmacéutico', 'dentista', 'veterinario', 'psicólogo'
        ]
    },
    {
        id: 'sports',
        name: 'Deportes',
        words: [
            'fútbol', 'baloncesto', 'tenis', 'béisbol', 'voleibol', 'hockey',
            'golf', 'natación', 'atletismo', 'boxeo', 'lucha', 'judo', 'karate',
            'taekwondo', 'esgrima', 'escalada', 'surf', 'esquí', 'snowboard',
            'patinaje', 'ciclismo', 'maratón', 'triatlón', 'gimnasia', 'danza',
            'yoga', 'pilates', 'crossfit', 'pesas', 'correr', 'caminar', 'saltar',
            'lanzar', 'atrapar', 'patear', 'golpear', 'nadar', 'bucear'
        ]
    },
    {
        id: 'emotions',
        name: 'Emociones',
        words: [
            'feliz', 'triste', 'enojado', 'sorprendido', 'asustado', 'confundido',
            'emocionado', 'nervioso', 'tranquilo', 'estresado', 'relajado', 'cansado',
            'energético', 'aburrido', 'interesado', 'curioso', 'preocupado', 'aliviado',
            'frustrado', 'satisfecho', 'orgulloso', 'avergonzado', 'culpable', 'inocente',
            'esperanzado', 'desesperado', 'optimista', 'pesimista', 'agradecido', 'celoso',
            'envidioso', 'generoso', 'egoísta', 'amable', 'grosero', 'paciente', 'impaciente'
        ]
    }
];

export const getRandomWord = (categoryId?: string): string => {
    let category: WordCategory;

    if (categoryId) {
        category = wordCategories.find(cat => cat.id === categoryId) || wordCategories[0];
    } else {
        // Seleccionar categoría aleatoria
        const randomIndex = Math.floor(Math.random() * wordCategories.length);
        category = wordCategories[randomIndex];
    }

    const randomWordIndex = Math.floor(Math.random() * category.words.length);
    return category.words[randomWordIndex];
};

export const getRandomCategory = (): WordCategory => {
    const randomIndex = Math.floor(Math.random() * wordCategories.length);
    return wordCategories[randomIndex];
}; 
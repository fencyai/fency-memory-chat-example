import { createSession } from '../createSession'

export async function POST() {
    return await createSession({
        createAgentTask: {
            taskType: 'MEMORY_CHAT',
            guardRails: {
                memoryTypes: [
                    {
                        memoryTypeId: 'mty_51c0e3fe67c749ec811deca735e6fa53',
                        match: {
                            pokemonTag: 'pokemons-v3',
                        },
                    },
                ],
            },
        },
    })
}

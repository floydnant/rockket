import { EntityPreview, EntityPreviewFlattend, EntityPreviewRecursive } from 'src/app/models/entities.model'
import { buildEntityTree, flattenEntityTree, getParentByChildId, traceEntity } from './utils'

const entityPreviewsFixture: EntityPreview[] = [
    { id: '1', name: 'First', childLists: ['3'], parentListId: '' },
    { id: '2', name: 'Second', childLists: [], parentListId: '' },
    { id: '3', name: 'First nested', childLists: ['4'], parentListId: '1' },
    { id: '4', name: 'Deep nested', childLists: [], parentListId: '3' },
]
const entityTreeFixture: EntityPreviewRecursive[] = [
    {
        id: '1',
        name: 'First',
        parentListId: '',
        children: [
            {
                id: '3',
                name: 'First nested',
                parentListId: '1',
                children: [{ id: '4', name: 'Deep nested', children: [], parentListId: '3' }],
            },
        ],
    },
    { id: '2', name: 'Second', parentListId: '', children: [] },
]

const entityTreeFlattenedFixture: EntityPreviewFlattend[] = [
    {
        id: '1',
        name: 'First',
        parentListId: '',
        childrenCount: 1,
        path: [],
    },
    {
        id: '3',
        name: 'First nested',
        parentListId: '1',
        childrenCount: 1,
        path: ['1'],
    },
    {
        id: '4',
        name: 'Deep nested',
        parentListId: '3',
        childrenCount: 0,
        path: ['1', '3'],
    },
    {
        id: '2',
        name: 'Second',
        parentListId: '',
        childrenCount: 0,
        path: [],
    },
]

// @TODO: Write proper tests with jest
describe('Store entity utils', () => {
    describe('buildEntityTree()', () => {
        it('should return the correct tree', () => {
            const entityTree = buildEntityTree(entityPreviewsFixture)
            expect(entityTree).toEqual(entityTreeFixture)
        })
    })

    describe('flattenEntityTree()', () => {
        it('should return the correct flattened equivalent of the tree', () => {
            const entityTreeFlattened = flattenEntityTree(entityTreeFixture)
            expect(entityTreeFlattened).toEqual(entityTreeFlattenedFixture)
        })
    })

    describe('traceEntity()', () => {
        it('should return the correct path to the given entity in the tree', () => {
            const trace = traceEntity(entityTreeFixture, '4')
            const traceFixture: EntityPreviewRecursive[] = [
                {
                    id: '1',
                    name: 'First',
                    parentListId: '',
                    children: [
                        {
                            id: '3',
                            name: 'First nested',
                            parentListId: '1',
                            children: [{ id: '4', name: 'Deep nested', children: [], parentListId: '3' }],
                        },
                    ],
                },
                {
                    id: '3',
                    name: 'First nested',
                    parentListId: '1',
                    children: [{ id: '4', name: 'Deep nested', children: [], parentListId: '3' }],
                },
                { id: '4', name: 'Deep nested', children: [], parentListId: '3' },
            ]
            expect(trace).toEqual(traceFixture)
        })
    })

    describe('getParentByChildId()', () => {
        it('should return the correct result', () => {
            const result = getParentByChildId(entityTreeFixture, '4')
            const resultFixture: ReturnType<typeof getParentByChildId> = {
                subTree: [{ id: '4', name: 'Deep nested', children: [], parentListId: '3' }],
                index: 0,
            }

            expect(result).toEqual(resultFixture)
        })
    })
})

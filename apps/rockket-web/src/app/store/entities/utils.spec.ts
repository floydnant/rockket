import { EntityPreview, EntityPreviewFlattend, EntityPreviewRecursive, EntityType } from '@rockket/commons'
import { buildEntityTree, flattenEntityTree, getParentEntityByChildId, traceEntity } from './utils'

const mockDate = new Date()

const entityPreviewsFixture: EntityPreview[] = [
    { id: '1', createdAt: mockDate, entityType: EntityType.Tasklist, title: 'First', parentId: '' },
    { id: '2', createdAt: mockDate, entityType: EntityType.Tasklist, title: 'Second', parentId: '' },
    { id: '3', createdAt: mockDate, entityType: EntityType.Tasklist, title: 'First nested', parentId: '1' },
    { id: '4', createdAt: mockDate, entityType: EntityType.Tasklist, title: 'Deep nested', parentId: '3' },
]
const entityTreeFixture: EntityPreviewRecursive[] = [
    {
        id: '1',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'First',
        parentId: '',
        children: [
            {
                id: '3',
                createdAt: mockDate,
                entityType: EntityType.Tasklist,
                title: 'First nested',
                parentId: '1',
                children: [
                    {
                        id: '4',
                        title: 'Deep nested',
                        children: [],
                        parentId: '3',
                        createdAt: mockDate,
                        entityType: EntityType.Tasklist,
                    },
                ],
            },
        ],
    },
    {
        id: '2',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'Second',
        parentId: '',
        children: [],
    },
]

const entityTreeFlattenedFixture: EntityPreviewFlattend[] = [
    {
        id: '1',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'First',
        parentId: '',
        childrenCount: 1,
        path: [],
    },
    {
        id: '3',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'First nested',
        parentId: '1',
        childrenCount: 1,
        path: ['1'],
    },
    {
        id: '4',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'Deep nested',
        parentId: '3',
        childrenCount: 0,
        path: ['1', '3'],
    },
    {
        id: '2',
        createdAt: mockDate,
        entityType: EntityType.Tasklist,
        title: 'Second',
        parentId: '',
        childrenCount: 0,
        path: [],
    },
]

// @TODO: Write proper tests with jest
describe('Store entity utils', () => {
    describe(`${buildEntityTree.name}()`, () => {
        it('should return the correct tree', () => {
            const entityTree = buildEntityTree(entityPreviewsFixture)
            expect(entityTree).toEqual(entityTreeFixture)
        })
    })

    describe(`${flattenEntityTree.name}()`, () => {
        it('should return the correct flattened equivalent of the tree', () => {
            const entityTreeFlattened = flattenEntityTree(entityTreeFixture)
            expect(entityTreeFlattened).toEqual(entityTreeFlattenedFixture)
        })
    })

    describe(`${traceEntity.name}()`, () => {
        it('should return the correct path to the given entity in the tree', () => {
            const trace = traceEntity(entityTreeFixture, '4')
            const traceFixture: EntityPreviewRecursive[] = [
                {
                    id: '1',
                    createdAt: mockDate,
                    entityType: EntityType.Tasklist,
                    title: 'First',
                    parentId: '',
                    children: [
                        {
                            id: '3',
                            createdAt: mockDate,
                            entityType: EntityType.Tasklist,
                            title: 'First nested',
                            parentId: '1',
                            children: [
                                {
                                    id: '4',
                                    createdAt: mockDate,
                                    entityType: EntityType.Tasklist,
                                    title: 'Deep nested',
                                    children: [],
                                    parentId: '3',
                                },
                            ],
                        },
                    ],
                },
                {
                    id: '3',
                    createdAt: mockDate,
                    entityType: EntityType.Tasklist,
                    title: 'First nested',
                    parentId: '1',
                    children: [
                        {
                            id: '4',
                            createdAt: mockDate,
                            entityType: EntityType.Tasklist,
                            title: 'Deep nested',
                            children: [],
                            parentId: '3',
                        },
                    ],
                },
                {
                    id: '4',
                    createdAt: mockDate,
                    entityType: EntityType.Tasklist,
                    title: 'Deep nested',
                    children: [],
                    parentId: '3',
                },
            ]
            expect(trace).toEqual(traceFixture)
        })
    })

    describe(`${getParentEntityByChildId.name}()`, () => {
        it('should return the correct result', () => {
            const result = getParentEntityByChildId(entityTreeFixture, '4')
            const resultFixture: ReturnType<typeof getParentEntityByChildId> = {
                subTree: [
                    {
                        id: '4',
                        createdAt: mockDate,
                        entityType: EntityType.Tasklist,
                        title: 'Deep nested',
                        children: [],
                        parentId: '3',
                    },
                ],
                index: 0,
            }

            expect(result).toEqual(resultFixture)
        })
    })
})

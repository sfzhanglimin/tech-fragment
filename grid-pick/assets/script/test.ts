import { _decorator, Camera, Color, Component, director, EventTouch, game, geometry, gfx, input, Input, Line, macro, Material, Mesh, MeshRenderer, Node, physics, primitives, Terrain, Touch, utils, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(Camera)
    public camera: Camera = null;

    @property(Terrain)
    public terrain: Terrain = null;

    @property(Node)
    public target: Node = null;

    @property
    public areaSize: number = 5;

    pointRay: geometry.Ray = null;

    touchPoint: Vec2 = Vec2.ZERO.clone();

    private grids: MeshRenderer[][] = []

    private dynamicMeshData: primitives.IDynamicGeometry[][] = []

    private vecPositions: Float32Array[][] = []

    protected start(): void {
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
        const material = new Material()
        material.initialize({
            effectName: "builtin-unlit"
        })

        const parent = this.node

        for (let x = 0; x < this.areaSize + 1; x++) {
            for (let z = 0; z < this.areaSize + 1; z++) {
                this.vecPositions[x] = this.vecPositions[x] ?? []
                this.vecPositions[x][z] = new Float32Array(3)
                this.vecPositions[x][z].fill(0)
            }
        }

        for (let x = 0; x < this.areaSize; x++) {
            for (let z = 0; z < this.areaSize; z++) {
                let node = new Node()
                let render = node.addComponent(MeshRenderer)
                const positions = new Float32Array(12)
                const indices = new Uint16Array(6)
                const normal = new Float32Array(12)

                for (let i = 0; i < 12; i += 3) {
                    positions[i + 0] = 0
                    positions[i + 1] = 0
                    positions[i + 2] = 0


                    normal[i + 0] = 0
                    normal[i + 1] = 1
                    normal[i + 2] = 0
                }

                const dynamicMeshData: primitives.IDynamicGeometry = {
                    positions: positions,
                    indices16: indices,
                    normals: normal
                }

                this.dynamicMeshData[x] = this.dynamicMeshData[x] ?? []
                this.dynamicMeshData[x][z] = dynamicMeshData

                let mesh = utils.MeshUtils.createDynamicMesh(0, dynamicMeshData)
                render.mesh = mesh


                render.setSharedMaterial(material, 0)

                this.grids[x] = this.grids[x] ?? []
                this.grids[x][z] = render

                node.parent = parent
            }
        }
    }


    protected onTouchEnd(aEvent: EventTouch): void {
        const result = this.checkPoint(aEvent.touch)
        if (result) {
            this.target.worldPosition = result.hitPoint.clone().add3f(0, 2, 0)
            // this.drawGrid(result.hitPoint)

            this.node.worldPosition = result.hitPoint //new Vec3(result.hitPoint.x - Math.floor(this.areaSize / 2), result.hitPoint.y, result.hitPoint.z - Math.floor(this.areaSize / 2))
        }
    }

    protected checkPoint(aTouch: Touch) {
        aTouch.getLocation(this.touchPoint)
        this.pointRay = this.camera.screenPointToRay(this.touchPoint.x, this.touchPoint.y, this.pointRay)
        if (this.pointRay && physics.PhysicsSystem.instance.raycastClosest(this.pointRay)) {
            return physics.PhysicsSystem.instance.raycastClosestResult;
        }
    }

    protected drawGrid(aWorldPoint: Vec3) {
        const startX = aWorldPoint.x - Math.floor(this.areaSize / 2)
        const startZ = aWorldPoint.z - Math.floor(this.areaSize / 2)

        for (let x = 0; x < this.areaSize + 1; x++) {
            for (let z = 0; z < this.areaSize + 1; z++) {
                const render = this.grids[x][z]
                const worldPos = new Vec3(startX + x, aWorldPoint.y, startZ + z)
                render.node.worldPosition = worldPos
                this.updateMesh(x, z, render, worldPos)
            }
        }
    }

    private _tempVec3 = new Vec3(0, 0, 0)
    protected updateMesh(aX: number, aZ: number, aRender: MeshRenderer, aWorld?: Vec3) {
        const dydata = this.dynamicMeshData[aX][aZ]
        const world = aWorld ?? aRender.node.worldPosition;
        this._tempVec3.set(world.x + aX, 0, world.z + aZ)
        const height = this.getMeshHeight(this._tempVec3)
        dydata.positions
    }

    protected getMeshHeight(aWorld: Vec3) {
        let result = 0
        geometry.Ray.fromPoints(this.pointRay, aWorld.clone().add3f(0, 200, 0), aWorld)
        if (physics.PhysicsSystem.instance.raycastClosest(this.pointRay)) {
            result = physics.PhysicsSystem.instance.raycastClosestResult.hitPoint.y;
        }

        return result;
    }

}


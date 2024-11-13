import { _decorator, Camera, Color, Component, director, EventTouch, game, geometry, gfx, input, Input, Line, macro, Material, Mesh, MeshRenderer, Node, physics, primitives, Terrain, Touch, utils, v2, v3, Vec2, Vec3 } from 'cc';
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

    @property(Material)
    public ableMaterial: Material = null;

    @property(Material)
    public unableMaterial: Material = null;

    pointRay: geometry.Ray = null;

    touchPoint: Vec2 = Vec2.ZERO.clone();

    private _lastTouch: Vec2 = v2();

    private _gridSize = .5
    private _heightOffset = 1.0


    private _meshNodes: MeshRenderer[][] = []

    private meshGeometries: primitives.IDynamicGeometry = null;

    // private dynamicMeshData: primitives.IDynamicGeometry[][] = []

    private _heightPos: number[][] = []

    start() {

        const parent = this.node

        this.createMeshPoints()

    }

    protected update(dt: number): void {
        const touch = input.getTouch(0)
        if (touch && !touch.getUILocation().equals(this._lastTouch, 0)) {
            touch.getUILocation(this._lastTouch)
            this.onTouchEnd(touch)
        }
    }

    protected createMeshPoints() {
        const floor = Math.floor(this.areaSize / 2) * -1
        for (let x = floor; x < floor * -1; ++x) {
            for (let z = floor; z < floor * -1; ++z) {
                this._meshNodes[x] = this._meshNodes[x] ?? []
                const node = new Node()
                node.parent = this.node

                const render = node.addComponent(MeshRenderer)

                this._meshNodes[x][z] = render

                const vec0 = v3(-this._gridSize, 0, -this._gridSize)
                const vec1 = v3(-this._gridSize, 0, this._gridSize)
                const vec2 = v3(this._gridSize, 0, this._gridSize)
                const vec3 = v3(this._gridSize, 0, -this._gridSize)

                const positions =
                    [
                        vec0.x, vec0.y, vec0.z,
                        vec1.x, vec1.y, vec1.z,
                        vec2.x, vec2.y, vec2.z,
                        vec3.x, vec3.y, vec3.z,
                    ]

                    const gemo = {
                        positions: new Float32Array(positions),
                        indices16: new Uint16Array(
                            [
                                0, 1, 2, 0, 2, 3
                            ]
                        ),
                        normals: new Float32Array(
                            [
                                0, 1, 0,
                                0, 1, 0,
                                0, 1, 0,
                                0, 1, 0
                            ]
                        ),
                        uvs: new Float32Array([
                            0, 0,
                            0, 1,
                            1, 1,
                            1, 0,
                        ])
                    }

                const newMesh = utils.MeshUtils.createDynamicMesh(0, gemo)

                render.mesh = newMesh;
                render.setSharedMaterial(this.ableMaterial, 0);
            }
        }
    }

    private onClick() {
        const render = this.node.getComponent(MeshRenderer);
        const positions =
            [
                -0.5, 0, -0.5,
                -0.5, 0, 0.5,
                0.5, 0, 0.5
            ]

        this.meshGeometries.positions = new Float32Array(positions)
        render.mesh.updateSubMesh(0, this.meshGeometries)
    }

    protected onTouchEnd(aTouch: Touch): void {
        const result = this.checkScreenPoint(aTouch)
        if (result) {
            const worldPos = result.hitPoint;

            // this.checkPoint(v3())
            // this.collectY(worldPos)
            const floor = Math.floor(this.areaSize / 2) * -1
            for (let x = floor; x < floor * -1; ++x) {
                for (let z = floor; z < floor * - 1; ++z) {
                    const vec0 = v3(x + worldPos.x - this._gridSize, 2, z + worldPos.z - this._gridSize)
                    const vec1 = v3(x + worldPos.x - this._gridSize, 2, z + worldPos.z + this._gridSize)
                    const vec2 = v3(x + worldPos.x + this._gridSize, 2, z + worldPos.z + this._gridSize)
                    const vec3 = v3(x + worldPos.x + this._gridSize, 2, z + worldPos.z - this._gridSize)

                    console.log(`>>>>>>>>>>>>>>>>>vec0:${vec0} vec1:${vec1} vec2:${vec2} vec3:${vec3}`)

                    

                    // vec0.y = (this.checkPoint(vec0)?.hitPoint.y ?? 1) + this._heightOffset
                    // vec1.y = (this.checkPoint(vec1)?.hitPoint.y ?? 1) + this._heightOffset
                    // vec2.y = (this.checkPoint(vec2)?.hitPoint.y ?? 1) + this._heightOffset
                    // vec3.y = (this.checkPoint(vec3)?.hitPoint.y ?? 1) + this._heightOffset
                    
                    console.log(`=================vec0:${vec0} vec1:${vec1} vec2:${vec2} vec3:${vec3}`)

                    const positions =
                        [
                            vec0.x, vec0.y, vec0.z,
                            vec1.x, vec1.y, vec1.z,
                            vec2.x, vec2.y, vec2.z,
                            vec3.x, vec3.y, vec3.z,
                        ]

                    
                    const gemo = {
                        positions: new Float32Array(positions),
                        indices16: new Uint16Array(
                            [
                                0, 1, 2, 0, 2, 3
                            ]
                        ),
                        normals: new Float32Array(
                            [
                                0, 1, 0,
                                0, 1, 0,
                                0, 1, 0,
                                0, 1, 0
                            ]
                        ),
                        uvs: new Float32Array([
                            0, 0,
                            0, 1,
                            1, 1,
                            1, 0,
                        ])
                    }

                    // this.meshGeometries.positions = new Float32Array(positions)
                    this._meshNodes[x][z].mesh.updateSubMesh(0, gemo)
                    // this.node.getComponent(MeshRenderer).mesh.updateSubMesh(0, this.meshGeometries)
                }
            }


        }
    }

    protected collectY(aPoint: Vec3) {
        for (let x = 0; x < this.areaSize; ++x) {
            for (let z = 0; z < this.areaSize; ++z) {
                this._heightPos[x] = this._heightPos[x] ?? []
                this._heightPos[x][z] = (this.checkPoint(v3(aPoint.x + x, aPoint.y, aPoint.z + z))?.hitPoint.y ?? 1) + this._heightOffset;
            }
        }
    }

    protected checkPoint(aPoint: Vec3) {
        const ray = geometry.Ray.create(aPoint.x, 200, aPoint.z, 0, -1, 0)
        if (physics.PhysicsSystem.instance.raycastClosest(ray)) {
            return physics.PhysicsSystem.instance.raycastClosestResult;
        }
    }

    protected checkScreenPoint(aTouch: Touch) {
        aTouch.getLocation(this.touchPoint)
        this.pointRay = this.camera.screenPointToRay(this.touchPoint.x, this.touchPoint.y, this.pointRay)
        if (this.pointRay && physics.PhysicsSystem.instance.raycastClosest(this.pointRay)) {
            return physics.PhysicsSystem.instance.raycastClosestResult;
        }
    }

}


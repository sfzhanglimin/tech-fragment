import { _decorator, Camera, Color, Component, director, EventTouch, game, geometry, gfx, input, Input, Line, macro, Material, Mesh, MeshRenderer, Node, physics, primitives, Terrain, Touch, utils, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MeshGrades')
export class MeshGrades extends Component {
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

        // input.on(Input.EventType.TOUCH_END, (aEvent: EventTouch) => {
        //     aEvent.touch.getLocation(this.touchPoint)
        //     this.pointRay = this.camera.screenPointToRay(this.touchPoint.x, this.touchPoint.y, this.pointRay)
        //     if (this.pointRay && physics.PhysicsSystem.instance.raycastClosest(this.pointRay)) {
        //         this.updateCenterWorld(physics.PhysicsSystem.instance.raycastClosestResult.hitPoint.clone())
        //     }
        // }, this)
    }

    protected update(dt: number): void {
        const touch = input.getTouch(0)
        if (touch && !touch.getUILocation().equals(this._lastTouch, 0)) {
            touch.getUILocation(this._lastTouch)

            const result = this.checkScreenPoint(touch)
            if (result) {
                const worldPos = result.hitPoint.clone();
                this.updateCenterWorld(worldPos);
            }
        }
    }

    protected createMeshPoints() {
        const floor = Math.floor(this.areaSize / 2) * -1
        for (let x = floor; x < -floor; ++x) {
            for (let z = floor; z < -floor; ++z) {
                const node = new Node()
                node.parent = this.node
                const render = node.addComponent(MeshRenderer)
                this._meshNodes[x] = this._meshNodes[x] ?? []
                this._meshNodes[x][z] = render
                render.setSharedMaterial(this.ableMaterial, 0)
            }
        }
    }

    protected updateCenterWorld(aWorld: Vec3) {
        const floor = Math.floor(this.areaSize / 2) * -1
        for (let x = floor; x < -floor; ++x) {
            for (let z = floor; z < -floor; ++z) {
                const node = this._meshNodes[x][z]
                const gemo = this.getMesh(v3(x + aWorld.x, 2, z + aWorld.z))
                if (node.mesh) {
                    node.mesh.updateSubMesh(0, gemo)
                }
                else {
                    node.mesh = utils.MeshUtils.createDynamicMesh(0, gemo)
                }
            }
        }
    }

    getMesh(aWorld: Vec3) {
        const vec0 = v3(aWorld.x - this._gridSize, 2, aWorld.z - this._gridSize)
        const vec1 = v3(aWorld.x - this._gridSize, 2, aWorld.z + this._gridSize)
        const vec2 = v3(aWorld.x + this._gridSize, 2, aWorld.z + this._gridSize)
        const vec3 = v3(aWorld.x + this._gridSize, 2, aWorld.z - this._gridSize)



        vec0.y = (this.checkPoint(vec0)?.hitPoint.y ?? 1) + this._heightOffset
        vec1.y = (this.checkPoint(vec1)?.hitPoint.y ?? 1) + this._heightOffset
        vec2.y = (this.checkPoint(vec2)?.hitPoint.y ?? 1) + this._heightOffset
        vec3.y = (this.checkPoint(vec3)?.hitPoint.y ?? 1) + this._heightOffset

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


        return gemo;

        // this.meshGeometries.positions = new Float32Array(positions)
        // aRender.mesh.updateSubMesh(0, gemo)
        // this.node.getComponent(MeshRenderer).mesh.updateSubMesh(0, this.meshGeometries)
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
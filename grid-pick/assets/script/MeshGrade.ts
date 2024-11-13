import { _decorator, Component, EventTouch, geometry, Input, input, Material, Node, physics, Vec2, Touch, Camera, Terrain, MeshRenderer, Mesh, utils, primitives, v3, Vec3, v2 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 1,X轴向右为正
 * 2.Z轴向下为正
 * 3.Y轴向下为正
 * 4.mesh坐标可以是世界坐标.无所谓.
 * 5.自定义纹理需要设置UV坐标.
 * 6.需要计算平面正面是不是向上的,不然如果不关闭剔除背面是看不到的.
 * 7.测算出的点的高度得加一点,不然会被地形覆盖看不见,不知道为啥.unity中就不需要
 */

@ccclass('MeshGrade')
export class MeshGrade extends Component {

    @property(Camera)
    public camera: Camera = null;

    @property(Terrain)
    public terrain: Terrain = null;

    @property(Node)
    public target: Node = null;

    @property(Material)
    public ableMaterial: Material = null;

    @property(Material)
    public unableMaterial: Material = null;

    touchPoint: Vec2 = Vec2.ZERO.clone();
    pointRay: geometry.Ray = null;

    private meshGeometries: primitives.IDynamicGeometry = null;

    private _lastTouch:Vec2 = v2();

    private _gridSize = .5
    private _heightOffset = 1.0

    start() {
        
        const parent = this.node

        this.createMeshPoints()

    }

    protected update(dt: number): void {
        const touch = input.getTouch(0)
        if (touch && !touch.getUILocation().equals(this._lastTouch,0)) {
            touch.getUILocation(this._lastTouch)
            this.onTouchEnd(touch)
        }
    }

    protected createMeshPoints() {
        const material = new Material()
        material.initialize({
            effectName: "builtin-unlit"
        })

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

        const edge1 = v3();
        const edge2 = v3();
        const normal = v3()

        Vec3.subtract(edge1, vec1, vec0);
        Vec3.subtract(edge2, vec2, vec0);

        Vec3.cross(normal, edge1, edge2)
        Vec3.normalize(normal, normal)
        console.log(`法线:${normal}`)

        this.meshGeometries = {
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
        const newMesh = utils.MeshUtils.createDynamicMesh(0, this.meshGeometries)

        const render = this.node.addComponent(MeshRenderer)
        render.mesh = newMesh;
        render.setSharedMaterial(this.ableMaterial, 0);

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
            // this.target.worldPosition = result.hitPoint.clone().add3f(0, 2, 0)
            // this.drawGrid(result.hitPoint)
            const worldPos = result.hitPoint;
            // this.node.worldPosition = result.hitPoint //new Vec3(result.hitPoint.x - Math.floor(this.areaSize / 2), result.hitPoint.y, result.hitPoint.z - Math.floor(this.areaSize / 2))

            const vec0 = v3(worldPos.x - this._gridSize, 0, worldPos.z - this._gridSize)
            const vec1 = v3(worldPos.x - this._gridSize, 0, worldPos.z + this._gridSize)
            const vec2 = v3(worldPos.x + this._gridSize, 0, worldPos.z + this._gridSize)
            const vec3 = v3(worldPos.x + this._gridSize, 0, worldPos.z - this._gridSize)

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

            this.meshGeometries.positions = new Float32Array(positions)
            this.node.getComponent(MeshRenderer).mesh.updateSubMesh(0, this.meshGeometries)
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



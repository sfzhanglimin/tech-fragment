import { _decorator, Component, gfx, Mesh, MeshRenderer, Node, primitives, utils } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(MeshRenderer)
    public meshRender:MeshRenderer = null;


    start() {
        this.createMesh();
    }

    createMesh(){
        const mesh = utils.MeshUtils.createMesh({
            positions:[0,0,0,0,0,1,1,0,1],
        });
        this.meshRender.mesh = mesh;
    }
}



import { _decorator, Component, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    @property(MeshRenderer)
    public meshRender:MeshRenderer = null;


    start() {
        
    }
}



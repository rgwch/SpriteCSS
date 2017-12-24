import {Imagen, Nodo} from "./sprites";

export class GrowingPacker {
    root: Nodo;
    fit(blocks: Imagen[]) {
        blocks.sort((a, b) => {
            return (b.w + b.h) - (a.w + a.h);
        });
        var len = blocks.length;
        var w = len > 0 ? blocks[0].w : 0;
        var h = len > 0 ? blocks[0].h : 0;
        this.root = <Nodo> {x: 0, y: 0, w: w, h: h};
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            var node = this.findNode(this.root, block.w, block.h);
            if (node)
                block.fit = this.splitNode(node, block.w, block.h);
            else
                block.fit = this.growNode(block.w, block.h);
        }
    }

    findNode(root: Nodo, w: number, h: number): Nodo {
        if (root.used)
            return this.findNode(root.right, w, h) || this.findNode(root.down, w, h);
        else if ((w <= root.w) && (h <= root.h))
            return root;
        else
            return null;
    }

    splitNode(node: Nodo, w: number, h: number): Nodo {
        node.used = true;
        node.down = <Nodo> {x: node.x, y: node.y + h, w: node.w, h: node.h - h};
        node.right = <Nodo> {x: node.x + w, y: node.y, w: node.w - w, h: h};
        return node;
    }

    growNode(w: number, h: number): Nodo {
        var canGrowDown = (w <= this.root.w);
        var canGrowRight = (h <= this.root.h);

        var shouldGrowRight = canGrowRight && (this.root.h >= (this.root.w + w)); // attempt to keep square-ish by growing right when height is much greater than width
        var shouldGrowDown = canGrowDown && (this.root.w >= (this.root.h + h)); // attempt to keep square-ish by growing down  when width  is much greater than height

        if (shouldGrowRight)
            return this.growRight(w, h);
        else if (shouldGrowDown)
            return this.growDown(w, h);
        else if (canGrowRight)
            return this.growRight(w, h);
        else if (canGrowDown)
            return this.growDown(w, h);
        else
            return null; // need to ensure sensible root starting size to avoid this happening
    }

    growRight(w: number, h: number): Nodo {
        this.root = <Nodo> {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w + w,
            h: this.root.h,
            down: this.root,
            right: {x: this.root.w, y: 0, w: w, h: this.root.h}
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    }

    growDown(w: number, h: number): Nodo {
        this.root = <Nodo> {
            used: true,
            x: 0,
            y: 0,
            w: this.root.w,
            h: this.root.h + h,
            down: {x: 0, y: this.root.h, w: this.root.w, h: h},
            right: this.root
        };
        var node = this.findNode(this.root, w, h);
        if (node)
            return this.splitNode(node, w, h);
        else
            return null;
    }

};
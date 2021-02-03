const data = [
    {
        id: 1,
        title: '课程1',
        children: [
            { id: 4, title: '课程1-1' },
            {
                id: 5,
                title: '课程1-2',
                children: [
                    { id: 6, title: '课程1-2-1' },
                    { id: 7, title: '课程1-2-2' },
                ],
            },
        ],
    },
    { id: 2, title: '课程2' },
    { id: 3, title: '课程3' },
]
function fn(data) {
    let objArr = []
    function arrFn(data) {
        data.forEach((item, index) => {
            if (!item.children) {
                objArr.push(item)
            } else {
                let temp = {
                    id: item.id,
                    title: item.title,
                }
                objArr.push(temp)
                arrFn(item.children)
            }
        })
    }
    arrFn(data)
    return objArr
}

console.log(fn(data))

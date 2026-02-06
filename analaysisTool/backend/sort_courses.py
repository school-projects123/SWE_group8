def group_by_course(items):
    '''
    Groups items by their course labels.
    To be called before file merging.
    Input is a list of (files, course label) pairs.
    returns a tuple of (course label, files) pairs.
    Example: 
    Input: [('file1.csv', '101'), ('file2.csv', '100'), ('file3.csv', '101')]
    Output: (('101', ('file1.py', 'file3.py')), ('100', ('file2.py',)))
    '''
    groups = {}
    for path, label in items:
        label = str(label).strip()
        groups.setdefault(label, []).append(path)
        
    return tuple((label, tuple(paths)) for label, paths in sorted(groups.items()))


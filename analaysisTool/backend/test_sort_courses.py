import pytest
from sort_courses import group_by_course


class TestGroupByCourse:
    """Test suite for the group_by_course function."""
    
    def test_basic_grouping(self):
        """Test basic grouping of files by course labels."""
        items = [
            ('file1.csv', '101'),
            ('file2.csv', '100'),
            ('file3.csv', '101')
        ]
        result = group_by_course(items)
        
        expected = (
            ('100', ('file2.csv',)),
            ('101', ('file1.csv', 'file3.csv'))
        )
        
        assert result == expected
    
    def test_single_course(self):
        """Test grouping when all files belong to the same course."""
        items = [
            ('file1.csv', '101'),
            ('file2.csv', '101'),
            ('file3.csv', '101')
        ]
        result = group_by_course(items)
        
        expected = (('101', ('file1.csv', 'file2.csv', 'file3.csv')),)
        
        assert result == expected
    
    def test_single_file(self):
        """Test grouping with a single file."""
        items = [('file1.csv', '101')]
        result = group_by_course(items)
        
        expected = (('101', ('file1.csv',)),)
        
        assert result == expected
    
    def test_empty_list(self):
        """Test grouping with an empty list of items."""
        items = []
        result = group_by_course(items)
        
        assert result == ()
    
    def test_numeric_course_labels(self):
        """Test that numeric course labels are properly handled."""
        items = [
            ('file1.csv', 101),
            ('file2.csv', 100),
            ('file3.csv', 101)
        ]
        result = group_by_course(items)
        
        expected = (
            ('100', ('file2.csv',)),
            ('101', ('file1.csv', 'file3.csv'))
        )
        
        assert result == expected
    
    def test_string_with_whitespace(self):
        """Test that course labels with whitespace are stripped."""
        items = [
            ('file1.csv', ' 101 '),
            ('file2.csv', '101'),
            ('file3.csv', '  101')
        ]
        result = group_by_course(items)
        
        expected = (('101', ('file1.csv', 'file2.csv', 'file3.csv')),)
        
        assert result == expected
    
    def test_sorted_output(self):
        """Test that the output is sorted by course label."""
        items = [
            ('file1.csv', '300'),
            ('file2.csv', '100'),
            ('file3.csv', '200')
        ]
        result = group_by_course(items)
        
        expected = (
            ('100', ('file2.csv',)),
            ('200', ('file3.csv',)),
            ('300', ('file1.csv',))
        )
        
        assert result == expected
    
    def test_many_courses(self):
        """Test grouping with multiple courses and multiple files."""
        items = [
            ('fileA.csv', 'CS101'),
            ('fileB.csv', 'CS102'),
            ('fileC.csv', 'CS101'),
            ('fileD.csv', 'CS103'),
            ('fileE.csv', 'CS102'),
            ('fileF.csv', 'CS101')
        ]
        result = group_by_course(items)
        
        expected = (
            ('CS101', ('fileA.csv', 'fileC.csv', 'fileF.csv')),
            ('CS102', ('fileB.csv', 'fileE.csv')),
            ('CS103', ('fileD.csv',))
        )
        
        assert result == expected

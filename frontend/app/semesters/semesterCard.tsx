'use client';
import { CourseOfStudy } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { getSelectedSemesters } from '@/lib/selectedSemestersParams';

export function SemesterCard({
  course,
}: {
  course: CourseOfStudy;
  onSemestersChange?: (semesters: string[]) => void;
  semestersValue?: string[];
}) {
  const readOnlySearchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleValueChange(semesters: string[]) {
    const params = updateSelectedSemestersInParams(
      readOnlySearchParams,
      course.abbreviation,
      semesters,
    );

    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Card>
      <CardHeader className="h-32 overflow-hidden rounded-t-lg bg-zinc-50 text-center">
        <CardTitle>{course.abbreviation}</CardTitle>
        <CardDescription>{course.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 pt-4">
        <p className="text-foreground">Semester</p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          className="justify-start"
          onValueChange={handleValueChange}
          defaultValue={getSelectedCourseSemesters(
            course.abbreviation,
            readOnlySearchParams,
          )}
        >
          {course.semesters.map((semester) => {
            return (
              <ToggleGroupItem key={semester} value={semester.toString()}>
                {semester}
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </CardContent>
    </Card>
  );
}

function getCourseIds(abbreviation: string, semesters: string[]) {
  return semesters.map(
    (semester) => `${abbreviation.toLowerCase()}${semester}`,
  );
}

function getSelectedCourseSemesters(
  abbreviation: string,
  searchParams: URLSearchParams,
) {
  const selectedSemesterIds = getSelectedSemesters(searchParams);
  if (selectedSemesterIds.length === 0) {
    return [];
  }

  let lowercaseAbbreviation = abbreviation.toLowerCase();
  return selectedSemesterIds
    .filter((semester) => semester.startsWith(lowercaseAbbreviation))
    .map((semester) => semester.replace(lowercaseAbbreviation, ''));
}

function updateSelectedSemestersInParams(
  searchParams: ReadonlyURLSearchParams,
  abbreviation: string,
  semesters: string[],
) {
  const params = new URLSearchParams(searchParams);

  const selectedSemesters = getSelectedSemesters(params);
  const selectedSemestersWithoutCurrentCourseOfStudy = selectedSemesters.filter(
    (courseId) => !courseId.startsWith(abbreviation.toLowerCase()),
  );

  const newSemesterIds = getCourseIds(abbreviation, semesters);
  const newSelectedSemesters = [
    ...selectedSemestersWithoutCurrentCourseOfStudy,
    ...newSemesterIds,
  ].sort();

  params.delete('semester');
  newSelectedSemesters.forEach((semester) => {
    params.append('semester', semester);
  });

  return params;
}

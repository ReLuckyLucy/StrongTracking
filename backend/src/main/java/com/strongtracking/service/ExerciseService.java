package com.strongtracking.service;

import com.strongtracking.dto.exercise.ExerciseCreateRequest;
import com.strongtracking.dto.exercise.ExerciseResponse;
import com.strongtracking.model.Exercise;
import com.strongtracking.model.User;
import com.strongtracking.repository.ExerciseRepository;
import com.strongtracking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private static final List<ExerciseData> PRESET_EXERCISES = List.of(
            new ExerciseData("卧推", "胸部", "杠铃卧推，锻炼胸大肌、三角肌前束、肱三头肌"),
            new ExerciseData("深蹲", "腿部", "杠铃深蹲，锻炼股四头肌、臀大肌、腘绳肌"),
            new ExerciseData("硬拉", "背部", "传统硬拉，锻炼竖脊肌、臀大肌、腘绳肌、斜方肌"),
            new ExerciseData("肩推", "肩部", "杠铃/哑铃肩推，锻炼三角肌、肱三头肌"),
            new ExerciseData("杠铃划船", "背部", "俯身杠铃划船，锻炼背阔肌、斜方肌、菱形肌"),
            new ExerciseData("引体向上", "背部", "自重引体向上，锻炼背阔肌、肱二头肌"),
            new ExerciseData("哑铃弯举", "手臂", "哑铃二头弯举，锻炼肱二头肌"),
            new ExerciseData("三头臂屈伸", "手臂", "绳索/哑铃三头臂屈伸，锻炼肱三头肌"),
            new ExerciseData("腿举", "腿部", "腿举机推举，锻炼股四头肌、臀大肌"),
            new ExerciseData("罗马尼亚硬拉", "腿部", "罗马尼亚硬拉，锻炼腘绳肌、臀大肌")
    );

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    @Transactional
    public void ensurePresetExercises() {
        for (ExerciseData data : PRESET_EXERCISES) {
            Optional<Exercise> existing = exerciseRepository.findPresetByName(data.name());
            if (existing.isEmpty()) {
                Exercise exercise = Exercise.builder()
                        .name(data.name())
                        .category(data.category())
                        .description(data.description())
                        .user(null)
                        .build();
                exerciseRepository.save(exercise);
            }
        }
    }

    public List<ExerciseResponse> listExercises(UUID userId) {
        ensurePresetExercises();
        List<Exercise> exercises = exerciseRepository.findAllAccessible(userId);
        return exercises.stream()
                .map(e -> new ExerciseResponse(
                        e.getId(),
                        e.getName(),
                        e.getCategory(),
                        e.getDescription(),
                        e.getUser() != null ? e.getUser().getId() : null
                ))
                .toList();
    }

    @Transactional
    public ExerciseResponse createExercise(ExerciseCreateRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Exercise exercise = Exercise.builder()
                .name(request.name())
                .category(request.category())
                .description(request.description())
                .user(user)
                .build();
        exerciseRepository.save(exercise);
        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getCategory(),
                exercise.getDescription(),
                exercise.getUser() != null ? exercise.getUser().getId() : null
        );
    }

    @Transactional
    public void deleteExercise(UUID exerciseId, UUID userId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Exercise not found"));

        if (exercise.getUser() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete system preset exercises");
        }
        if (!exercise.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your exercise");
        }
        exerciseRepository.delete(exercise);
    }

    private record ExerciseData(String name, String category, String description) {}
}
